export default {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'color',
      title: 'Couleur',
      type: 'string',
      description: 'Code couleur hexadécimal (ex: #E63946)',
    },
    {
      name: 'icon',
      title: 'Icône',
      type: 'string',
      description: "Nom de l'icône Lucide (ex: TrendingUp)",
    },
  ],
  preview: {
    select: {
      title: 'title',
      color: 'color',
    },
    prepare(selection: any) {
      const { title, color } = selection
      return {
        title,
        subtitle: color || '',
      }
    },
  },
}
