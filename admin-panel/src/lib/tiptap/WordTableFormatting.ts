import JSZip from 'jszip';

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

type StyleMap = Record<string, string>;

interface TableStylePart {
  table: StyleMap;
  cell: StyleMap;
}

interface TableStyleDefinition extends TableStylePart {
  conditions: Record<string, TableStylePart>;
}

interface ImportedTableFormat {
  table: StyleMap;
  rows: StyleMap[][];
  headerRows: boolean[];
}

function directChildren(parent: Element | null, name: string): Element[] {
  if (!parent) return [];
  return Array.from(parent.childNodes).filter(
    (node): node is Element =>
      node.nodeType === 1 && (node as Element).localName === name,
  );
}

function directChild(parent: Element | null, name: string): Element | null {
  return directChildren(parent, name)[0] || null;
}

function wordAttribute(element: Element | null, name: string): string {
  if (!element) return '';
  return element.getAttributeNS(WORD_NAMESPACE, name) ||
    element.getAttribute(`w:${name}`) ||
    element.getAttribute(name) ||
    '';
}

function pointsFromTwips(value: string): string | null {
  const twips = Number(value);
  return Number.isFinite(twips) && twips > 0 ? `${twips / 20}pt` : null;
}

function widthFromWord(element: Element | null): string | null {
  const value = wordAttribute(element, 'w');
  if (!value) return null;
  if (wordAttribute(element, 'type') === 'pct') {
    const percent = Number(value) / 50;
    return Number.isFinite(percent) && percent > 0 ? `${percent}%` : null;
  }
  return pointsFromTwips(value);
}

function borderStyle(element: Element | null): string | null {
  if (!element) return null;
  const type = wordAttribute(element, 'val');
  if (!type || type === 'nil' || type === 'none') return 'none';

  const styles: Record<string, string> = {
    single: 'solid',
    thick: 'solid',
    double: 'double',
    dotted: 'dotted',
    dashed: 'dashed',
    dashDot: 'dashed',
    dashSmallGap: 'dashed',
    dotDash: 'dashed',
    dotDotDash: 'dotted',
    inset: 'inset',
    outset: 'outset',
  };
  const cssStyle = styles[type] || 'solid';
  const eighthPoints = Number(wordAttribute(element, 'sz')) || 4;
  const width = `${Math.max(0.25, eighthPoints / 8)}pt`;
  const rawColor = wordAttribute(element, 'color');
  const color = /^[0-9a-f]{6}$/i.test(rawColor) ? `#${rawColor}` : '#94a3b8';
  return `${width} ${cssStyle} ${color}`;
}

function borderStyles(parent: Element | null): StyleMap {
  const borders = directChild(parent, 'tcBorders') || directChild(parent, 'tblBorders');
  const styles: StyleMap = {};
  const sides: Record<string, string[]> = {
    'border-top': ['top'],
    'border-right': ['end', 'right'],
    'border-bottom': ['bottom'],
    'border-left': ['start', 'left'],
  };

  for (const [property, names] of Object.entries(sides)) {
    const border = names.map((name) => directChild(borders, name)).find(Boolean);
    const value = borderStyle(border || null);
    if (value) styles[property] = value;
  }

  const insideHorizontal = borderStyle(directChild(borders, 'insideH'));
  const insideVertical = borderStyle(directChild(borders, 'insideV'));
  if (insideHorizontal) styles['--word-inside-horizontal-border'] = insideHorizontal;
  if (insideVertical) styles['--word-inside-vertical-border'] = insideVertical;

  return styles;
}

function cellProperties(properties: Element | null): StyleMap {
  const styles: StyleMap = {};
  const shading = directChild(properties, 'shd');
  const fill = wordAttribute(shading, 'fill');
  if (/^[0-9a-f]{6}$/i.test(fill)) styles['background-color'] = `#${fill}`;

  const verticalAlignment = wordAttribute(directChild(properties, 'vAlign'), 'val');
  const verticalValues: Record<string, string> = {
    top: 'top',
    center: 'middle',
    bottom: 'bottom',
  };
  if (verticalValues[verticalAlignment]) styles['vertical-align'] = verticalValues[verticalAlignment];

  const margins = directChild(properties, 'tcMar');
  const marginProperties: Record<string, string[]> = {
    'padding-top': ['top'],
    'padding-right': ['end', 'right'],
    'padding-bottom': ['bottom'],
    'padding-left': ['start', 'left'],
  };
  for (const [property, names] of Object.entries(marginProperties)) {
    const margin = names.map((name) => directChild(margins, name)).find(Boolean);
    const value = pointsFromTwips(wordAttribute(margin || null, 'w'));
    if (value) styles[property] = value;
  }

  const width = widthFromWord(directChild(properties, 'tcW'));
  if (width) styles.width = width;
  return { ...styles, ...borderStyles(properties) };
}

function tableProperties(properties: Element | null): StyleMap {
  const styles: StyleMap = { 'border-collapse': 'collapse' };
  const shading = wordAttribute(directChild(properties, 'shd'), 'fill');
  if (/^[0-9a-f]{6}$/i.test(shading)) styles['background-color'] = `#${shading}`;
  const width = widthFromWord(directChild(properties, 'tblW'));
  if (width) styles.width = width;

  const layout = wordAttribute(directChild(properties, 'tblLayout'), 'type');
  if (layout === 'fixed') styles['table-layout'] = 'fixed';

  const alignment = wordAttribute(directChild(properties, 'jc'), 'val');
  if (alignment === 'center') {
    styles['margin-left'] = 'auto';
    styles['margin-right'] = 'auto';
  }

  return { ...styles, ...borderStyles(properties) };
}

function parseTableStyles(xml: string): Map<string, TableStyleDefinition> {
  const result = new Map<string, TableStyleDefinition>();
  if (!xml) return result;

  const document = new DOMParser().parseFromString(xml, 'application/xml');
  for (const style of Array.from(document.getElementsByTagNameNS(WORD_NAMESPACE, 'style'))) {
    if (wordAttribute(style, 'type') !== 'table') continue;
    const id = wordAttribute(style, 'styleId');
    if (!id) continue;

    const definition: TableStyleDefinition = {
      table: tableProperties(directChild(style, 'tblPr')),
      cell: cellProperties(directChild(style, 'tcPr')),
      conditions: {},
    };

    for (const conditional of directChildren(style, 'tblStylePr')) {
      const type = wordAttribute(conditional, 'type');
      if (!type) continue;
      definition.conditions[type] = {
        table: tableProperties(directChild(conditional, 'tblPr')),
        cell: cellProperties(directChild(conditional, 'tcPr')),
      };
    }
    result.set(id, definition);
  }
  return result;
}

function mergeStyles(element: Element, styles: StyleMap) {
  const declarations = new Map<string, string>();
  for (const declaration of (element.getAttribute('style') || '').split(';')) {
    const separator = declaration.indexOf(':');
    if (separator <= 0) continue;
    declarations.set(declaration.slice(0, separator).trim().toLowerCase(), declaration.slice(separator + 1).trim());
  }
  for (const [property, value] of Object.entries(styles)) declarations.set(property, value);
  if (declarations.size) {
    element.setAttribute('style', [...declarations].map(([property, value]) => `${property}: ${value}`).join('; '));
  }
}

function isEnabled(value: string): boolean {
  return value !== '0' && value.toLowerCase() !== 'false';
}

function tableConditionEnabled(look: Element | null, name: string, bit: number): boolean {
  const explicit = wordAttribute(look, name);
  if (explicit) return isEnabled(explicit);
  const value = wordAttribute(look, 'val');
  return value ? (parseInt(value, 16) & bit) !== 0 : true;
}

function tableCellStyles(
  table: Element,
  tableStyle: TableStyleDefinition | undefined,
): ImportedTableFormat {
  const tablePr = directChild(table, 'tblPr');
  const tableLook = directChild(tablePr, 'tblLook');
  const tableStyleNode = directChild(tablePr, 'tblStyle');
  const tableStyles = {
    ...(tableStyle?.table || {}),
    ...tableProperties(tablePr),
  };
  const tableBorderProperties = {
    ...(tableStyle?.table || {}),
    ...borderStyles(tablePr),
  };
  const rows: StyleMap[][] = [];
  const headerRows: boolean[] = [];
  const grid = directChild(table, 'tblGrid');
  const gridWidths = directChildren(grid, 'gridCol').map((column) => pointsFromTwips(wordAttribute(column, 'w')));
  const xmlRows = directChildren(table, 'tr');
  const useFirstRow = tableConditionEnabled(tableLook, 'firstRow', 0x20);
  const useFirstColumn = tableConditionEnabled(tableLook, 'firstColumn', 0x80);
  const useLastRow = tableConditionEnabled(tableLook, 'lastRow', 0x40);
  const useLastColumn = tableConditionEnabled(tableLook, 'lastColumn', 0x100);
  const useHorizontalBands = !tableConditionEnabled(tableLook, 'noHBand', 0x200);
  const useVerticalBands = !tableConditionEnabled(tableLook, 'noVBand', 0x400);

  xmlRows.forEach((row, rowIndex) => {
    const rowProperties = directChild(row, 'trPr');
    const headerMarker = directChild(rowProperties, 'tblHeader');
    const isHeader = Boolean(headerMarker && isEnabled(wordAttribute(headerMarker, 'val') || '1'));
    headerRows.push(isHeader);
    const xmlCells = directChildren(row, 'tc');
    let gridColumn = 0;
    const rowStyles: StyleMap[] = [];

    xmlCells.forEach((cell, cellIndex) => {
      const cellPropertiesNode = directChild(cell, 'tcPr');
      const span = Number(wordAttribute(directChild(cellPropertiesNode, 'gridSpan'), 'val')) || 1;
      const conditions: TableStylePart[] = [];
      if (rowIndex === 0 && useFirstRow) conditions.push(tableStyle?.conditions.firstRow || { table: {}, cell: {} });
      if (rowIndex === xmlRows.length - 1 && useLastRow) conditions.push(tableStyle?.conditions.lastRow || { table: {}, cell: {} });
      if (cellIndex === 0 && useFirstColumn) conditions.push(tableStyle?.conditions.firstCol || { table: {}, cell: {} });
      if (cellIndex === xmlCells.length - 1 && useLastColumn) conditions.push(tableStyle?.conditions.lastCol || { table: {}, cell: {} });
      if (useHorizontalBands) {
        const band = rowIndex % 2 === 0 ? 'band1Horz' : 'band2Horz';
        conditions.push(tableStyle?.conditions[band] || { table: {}, cell: {} });
      }
      if (useVerticalBands) {
        const band = cellIndex % 2 === 0 ? 'band1Vert' : 'band2Vert';
        conditions.push(tableStyle?.conditions[band] || { table: {}, cell: {} });
      }

      const style: StyleMap = {
        ...(tableStyle?.cell || {}),
        ...conditions.reduce((result, condition) => ({ ...result, ...condition.cell }), {}),
        ...cellProperties(cellPropertiesNode),
      };

      if (!style.width && gridWidths[gridColumn]) style.width = gridWidths[gridColumn] as string;

      const edges: Array<[string, string]> = [
        ['border-top', rowIndex === 0 ? 'border-top' : '--word-inside-horizontal-border'],
        ['border-bottom', rowIndex === xmlRows.length - 1 ? 'border-bottom' : '--word-inside-horizontal-border'],
        ['border-left', cellIndex === 0 ? 'border-left' : '--word-inside-vertical-border'],
        ['border-right', cellIndex === xmlCells.length - 1 ? 'border-right' : '--word-inside-vertical-border'],
      ];
      const cellBorders = borderStyles(cellPropertiesNode);
      const conditionBorders = conditions.reduce(
        (result, condition) => ({
          ...result,
          ...borderStylesFromMap(condition.table),
          ...borderStylesFromMap(condition.cell),
        }),
        {} as StyleMap,
      );
      for (const [property, tableBorder] of edges) {
        style[property] = cellBorders[property] || conditionBorders[property] ||
          tableBorderProperties[tableBorder] ||
          style[property] || '1px solid #cbd5e1';
      }

      rowStyles.push(style);
      gridColumn += span;
    });
    rows.push(rowStyles);
  });

  return { table: tableStyles, rows, headerRows };
}

function borderStylesFromMap(styles: StyleMap): StyleMap {
  return Object.fromEntries(Object.entries(styles).filter(([property]) => property.startsWith('border-')));
}

export async function restoreWordTableFormatting(html: string, arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) return html;

    const xmlDocument = new DOMParser().parseFromString(documentXml, 'application/xml');
    if (xmlDocument.getElementsByTagName('parsererror').length) return html;
    const wordTables = Array.from(xmlDocument.getElementsByTagNameNS(WORD_NAMESPACE, 'tbl'));
    if (!wordTables.length) return html;

    const styleXml = await zip.file('word/styles.xml')?.async('string');
    const styleDefinitions = parseTableStyles(styleXml || '');
    const htmlDocument = new DOMParser().parseFromString(html, 'text/html');
    const htmlTables = Array.from(htmlDocument.querySelectorAll('table'));

    htmlTables.forEach((table, tableIndex) => {
      const wordTable = wordTables[tableIndex];
      if (!wordTable) return;
      const styleId = wordAttribute(directChild(directChild(wordTable, 'tblPr'), 'tblStyle'), 'val');
      const format = tableCellStyles(wordTable, styleDefinitions.get(styleId));
      mergeStyles(table, format.table);

      const htmlRows = Array.from(table.rows);
      htmlRows.forEach((row, rowIndex) => {
        const rowStyles = format.rows[rowIndex] || [];
        if (format.headerRows[rowIndex]) {
          Array.from(row.cells).forEach((cell) => {
            if (cell.tagName.toLowerCase() !== 'td') return;
            const header = htmlDocument.createElement('th');
            for (const attribute of Array.from(cell.attributes)) header.setAttribute(attribute.name, attribute.value);
            while (cell.firstChild) header.appendChild(cell.firstChild);
            cell.replaceWith(header);
          });
        }

        Array.from(row.cells).forEach((cell, cellIndex) => {
          const styles = rowStyles[cellIndex];
          if (styles) mergeStyles(cell, styles);
        });
      });
    });

    return htmlDocument.body.innerHTML;
  } catch (error) {
    console.warn('[WordEditor table formatting]', error);
    return html;
  }
}