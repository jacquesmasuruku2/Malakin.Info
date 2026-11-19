'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Calendar,
  Camera,
  DollarSign,
  Edit,
  Heart,
  Mail,
  MessageSquare,
  Power,
  Save,
  Settings,
  User,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { authFetch } from '@/lib/client-auth';
import { logoutLocalSession, persistLocalUser } from '@/lib/theme';
import { useAccountUser } from '@/lib/use-account-user';
import { getMessages } from '@/lib/i18n';
import { getDateLocale, pickCopy, t, tAccount } from '@/lib/copy';

type ProfileUser = {
  [key: string]: unknown;
  name?: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | Date | null;
  _count?: {
    jobApplications?: number;
    comments?: number;
    likes?: number;
    favorites?: number;
    donations?: number;
  };
};

export default function ProfilePage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const messages = getMessages(locale);
  const { user: accountUser, ready } = useAccountUser();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    if (!ready) return;

    const loadProfile = async () => {
      if (!accountUser) {
        window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      setUser(accountUser);
      setFormData({
        name: accountUser.name || '',
        bio: accountUser.bio || '',
      });

      try {
        const response = await authFetch('/api/user/profile');
        if (response.status === 401) {
          window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        if (!response.ok) return;
        const profile: ProfileUser = await response.json();
        setUser(profile);
        setFormData({
          name: profile.name || '',
          bio: profile.bio || '',
        });
        persistLocalUser(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  // Keep the effect tied to the stable user identity; persisting the refreshed profile updates the user object.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, accountUser?.id, locale]);

  const handleSave = async () => {
    try {
      const response = await authFetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser: ProfileUser = await response.json();
        setUser((current) => {
          const next = { ...current, ...updatedUser };
          persistLocalUser(next);
          return next;
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const payload = new FormData();
      payload.append('file', file);
      const response = await authFetch('/api/user/avatar', {
        method: 'POST',
        body: payload,
      });

      if (response.status === 401) {
        window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(window.location.href)}`;
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible de changer la photo');
      }

      const updatedUser: ProfileUser = await response.json();
      setUser((current) => {
        const next = { ...current, ...updatedUser };
        persistLocalUser(next);
        return next;
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(error instanceof Error ? error.message : 'Impossible de changer la photo de profil.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    logoutLocalSession();
    await signOut({ callbackUrl: '/' });
  };

  if (!ready || !user) {
    return <div className="min-h-screen flex items-center justify-center">{t(locale, 'loading')}</div>;
  }

  const activityItems = [
    {
      icon: Briefcase,
      label: pickCopy(locale, {
        fr: 'Mes candidatures',
        en: 'My applications',
        es: 'Mis candidaturas',
        sw: 'Maombi yangu',
        ln: 'Ba candidature na ngai',
        rw: 'Amasaba yanjye',
      }),
      count: user._count?.jobApplications || 0,
      href: `/${locale}/compte/candidatures`,
      description: pickCopy(locale, {
        fr: 'Suivre mes demandes',
        en: 'Track my applications',
        es: 'Seguir mis solicitudes',
        sw: 'Fuatilia maombi yangu',
        ln: 'Kolanda ba demande na ngai',
        rw: 'Kurikirana ubusabe bwanjye',
      }),
      iconStyle: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    },
    {
      icon: MessageSquare,
      label: messages.nav.myComments,
      count: user._count?.comments || 0,
      href: `/${locale}/compte/commentaires`,
      description: pickCopy(locale, {
        fr: 'Mes échanges avec la communauté',
        en: 'My conversations with the community',
        es: 'Mis conversaciones con la comunidad',
        sw: 'Mazungumzo yangu na jamii',
        ln: 'Masolo na ngai na lisanga',
        rw: 'Ibiganiro byanjye n’abaturage',
      }),
      iconStyle: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    },
    {
      icon: Heart,
      label: messages.nav.myLikes,
      count: user._count?.likes || 0,
      href: `/${locale}/compte/likes`,
      description: pickCopy(locale, {
        fr: 'Les articles que j’ai aimés',
        en: 'Articles I have liked',
        es: 'Artículos que me han gustado',
        sw: 'Makala nilizopenda',
        ln: 'Masolo oyo nasepelaki na yango',
        rw: 'Inkuru nakunze',
      }),
      iconStyle: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    },
    {
      icon: Bookmark,
      label: messages.nav.favorites,
      count: user._count?.favorites || 0,
      href: `/${locale}/compte/favoris`,
      description: pickCopy(locale, {
        fr: 'Mes contenus enregistrés',
        en: 'My saved content',
        es: 'Mis contenidos guardados',
        sw: 'Maudhui yangu yaliyohifadhiwa',
        ln: 'Ba contenus nabombaki',
        rw: 'Ibiri nabitse',
      }),
      iconStyle: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    },
    {
      icon: DollarSign,
      label: pickCopy(locale, {
        fr: 'Mes dons',
        en: 'My donations',
        es: 'Mis donaciones',
        sw: 'Michango yangu',
        ln: 'Ba don na ngai',
        rw: 'Impano zanjye',
      }),
      count: user._count?.donations || 0,
      href: `/${locale}/compte/dons`,
      description: pickCopy(locale, {
        fr: 'Mon soutien à MalakInfo',
        en: 'My support for MalakInfo',
        es: 'Mi apoyo a MalakInfo',
        sw: 'Msaada wangu kwa MalakInfo',
        ln: 'Lisungi na ngai mpo na MalakInfo',
        rw: 'Ubufasha bwanjye kuri MalakInfo',
      }),
      iconStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
  ];

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(getDateLocale(locale), {
        month: 'long',
        year: 'numeric',
      })
    : pickCopy(locale, {
        fr: 'Récemment',
        en: 'Recently',
        es: 'Recientemente',
        sw: 'Hivi karibuni',
        ln: 'Kala mingi te',
        rw: 'Vuba aha',
      });

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Activity className="h-4 w-4" />
              {pickCopy(locale, {
                fr: 'Espace personnel',
                en: 'Personal space',
                es: 'Espacio personal',
                sw: 'Nafasi yangu',
                ln: 'Esika na ngai',
                rw: 'Umwanya wanjye',
              })}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {pickCopy(locale, {
                fr: 'Bonjour',
                en: 'Welcome',
                es: 'Hola',
                sw: 'Habari',
                ln: 'Mbote',
                rw: 'Muraho',
              })}
              {user.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {pickCopy(locale, {
                fr: 'Retrouvez vos activités et accédez rapidement à votre espace.',
                en: 'Review your activity and quickly access your account.',
                es: 'Consulta tu actividad y accede rápidamente a tu cuenta.',
                sw: 'Angalia shughuli zako na ufikie akaunti yako kwa urahisi.',
                ln: 'Talá misala na yo mpe kota noki na compte na yo.',
                rw: 'Reba ibikorwa byawe kandi ugere kuri konti yawe vuba.',
              })}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-semibold text-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {pickCopy(locale, {
              fr: 'Compte connecté',
              en: 'Account connected',
              es: 'Cuenta conectada',
              sw: 'Akaunti imeunganishwa',
              ln: 'Compte ekangami',
              rw: 'Konti ihujwe',
            })}
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#081C3D] via-[#0B3B8B] to-[#2455a0] text-white shadow-xl shadow-primary/10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-28 h-72 w-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-36 right-28 h-72 w-72 rounded-full border border-white/10"
          />
          <Image
            src="/images/logo.png"
            alt=""
            aria-hidden="true"
            width={2172}
            height={724}
            unoptimized
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-auto w-[75%] max-w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.055] grayscale brightness-0 invert"
          />
          <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || user.email || ''}
                    width={112}
                    height={112}
                    unoptimized
                    className="h-24 w-24 rounded-full border-4 border-secondary/80 object-cover shadow-lg sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-secondary/80 bg-white/10 shadow-lg sm:h-28 sm:w-28">
                    <User className="h-11 w-11 text-white/85" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0B3B8B] bg-secondary text-[#081C3D] shadow-md transition hover:scale-105 disabled:cursor-wait disabled:opacity-60"
                  aria-label={pickCopy(locale, {
                    fr: 'Changer la photo de profil',
                    en: 'Change profile photo',
                    es: 'Cambiar foto de perfil',
                    sw: 'Badilisha picha ya wasifu',
                    ln: 'Bongola foto ya profil',
                    rw: 'Hindura ifoto y’umwirondoro',
                  })}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  MalakInfo
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    aria-label={pickCopy(locale, {
                      fr: 'Nom',
                      en: 'Name',
                      es: 'Nombre',
                      sw: 'Jina',
                      ln: 'Kombo',
                      rw: 'Izina',
                    })}
                    className="w-full max-w-md rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xl font-bold text-white outline-none placeholder:text-white/60 focus:ring-2 focus:ring-secondary"
                  />
                ) : (
                  <h2 className="break-words text-2xl font-bold sm:text-3xl">
                    {user.name || user.email}
                  </h2>
                )}
                <p className="mt-2 flex items-center justify-center gap-2 break-all text-sm text-white/80 sm:justify-start">
                  <Mail className="h-4 w-4 shrink-0" />
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/75 sm:justify-start">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {pickCopy(locale, {
                      fr: 'Membre depuis',
                      en: 'Member since',
                      es: 'Miembro desde',
                      sw: 'Mwanachama tangu',
                      ln: 'Membre banda',
                      rw: 'Umunyamuryango kuva',
                    })}{' '}
                    {memberSince}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-secondary sm:block" />
                  <span>
                    {pickCopy(locale, {
                      fr: 'Espace membre',
                      en: 'Member area',
                      es: 'Área de miembro',
                      sw: 'Eneo la mwanachama',
                      ln: 'Esika ya ba membre',
                      rw: 'Umwanya w’umunyamuryango',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing
                  ? pickCopy(locale, {
                      fr: 'Annuler',
                      en: 'Cancel',
                      es: 'Cancelar',
                      sw: 'Ghairi',
                      ln: 'Tika',
                      rw: 'Hagarika',
                    })
                  : pickCopy(locale, {
                      fr: 'Modifier mon profil',
                      en: 'Edit my profile',
                      es: 'Editar mi perfil',
                      sw: 'Hariri wasifu wangu',
                      ln: 'Bongola profil na ngai',
                      rw: 'Hindura umwirondoro wanjye',
                    })}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-[#081C3D] transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Save className="h-4 w-4" />
                  {tAccount(locale, 'saveChanges')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/50 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <Power className="h-4 w-4" />
                  {tAccount(locale, 'logout')}
                </button>
              )}
            </div>

            <div className="border-t border-white/15 pt-5 lg:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-white/90">
                {messages.common.about}
              </h3>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(event) =>
                    setFormData({ ...formData, bio: event.target.value })
                  }
                  placeholder={pickCopy(locale, {
                    fr: 'Parlez-nous de vous...',
                    en: 'Tell us about yourself...',
                    es: 'Cuéntanos sobre ti...',
                    sw: 'Tuambie kukuhusu...',
                    ln: 'Loba na biso mpo na yo...',
                    rw: 'Tuvugire ibyawe...',
                  })}
                  className="w-full resize-y rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:ring-2 focus:ring-secondary"
                  rows={3}
                />
              ) : (
                <p className="max-w-3xl text-sm leading-6 text-white/75">
                  {user.bio ||
                    pickCopy(locale, {
                      fr: 'Ajoutez quelques mots à votre profil pour vous présenter à la communauté.',
                      en: 'Add a few words to your profile to introduce yourself to the community.',
                      es: 'Añade unas palabras a tu perfil para presentarte a la comunidad.',
                      sw: 'Ongeza maneno machache kwenye wasifu wako ili ujitambulishe kwa jamii.',
                      ln: 'Bakisa mwa maloba na profil na yo mpo na komilakisa na lisanga.',
                      rw: 'Ongeraho amagambo make ku mwirondoro wawe kugira ngo wiyereke abandi.',
                    })}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="activity-heading">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {pickCopy(locale, {
                  fr: 'Votre présence',
                  en: 'Your activity',
                  es: 'Tu actividad',
                  sw: 'Shughuli zako',
                  ln: 'Misala na yo',
                  rw: 'Ibikorwa byawe',
                })}
              </p>
              <h2 id="activity-heading" className="mt-1 text-2xl font-bold text-foreground">
                {pickCopy(locale, {
                  fr: 'Vos activités sur MalakInfo',
                  en: 'Your MalakInfo activity',
                  es: 'Tu actividad en MalakInfo',
                  sw: 'Shughuli zako kwenye MalakInfo',
                  ln: 'Misala na yo na MalakInfo',
                  rw: 'Ibikorwa byawe kuri MalakInfo',
                })}
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              {pickCopy(locale, {
                fr: 'Chaque carte vous mène directement à vos contributions et contenus.',
                en: 'Each card takes you straight to your contributions and saved content.',
                es: 'Cada tarjeta te lleva directamente a tus contribuciones y contenidos.',
                sw: 'Kila kadi inakupeleka moja kwa moja kwenye michango na maudhui yako.',
                ln: 'Karte moko na moko ememaka yo mbala moko na misala mpe contenus na yo.',
                rw: 'Buri karita ikugeza ku byo watanze n’ibyo wabikije.',
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-56 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.iconStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                    {new Intl.NumberFormat(locale).format(item.count)}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <Link
          href={`/${locale}/compte/parametres`}
          className="group mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">
                {pickCopy(locale, {
                  fr: 'Personnalisez votre espace',
                  en: 'Personalize your space',
                  es: 'Personaliza tu espacio',
                  sw: 'Binafsishe nafasi yako',
                  ln: 'Bongisa esika na yo',
                  rw: 'Tunganya umwanya wawe',
                })}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pickCopy(locale, {
                  fr: 'Choisissez la langue du site, le thème d’affichage et les notifications que vous souhaitez recevoir.',
                  en: 'Choose the site language, display theme, and notifications you want to receive.',
                  es: 'Elige el idioma del sitio, el tema visual y las notificaciones que quieres recibir.',
                  sw: 'Chagua lugha ya tovuti, mwonekano na arifa unazotaka kupokea.',
                  ln: 'Pona monoko ya site, motindo ya kolakisa mpe ba notification oyo olingi kozwa.',
                  rw: 'Hitamo ururimi rw’urubuga, uko rusa, n’imenyesha ushaka kwakira.',
                })}
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition group-hover:bg-primary/90">
            {pickCopy(locale, {
              fr: 'Ouvrir les réglages',
              en: 'Open settings',
              es: 'Abrir ajustes',
              sw: 'Fungua mipangilio',
              ln: 'Fungola ba réglages',
              rw: 'Fungura igenamiterere',
            })}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </main>
  );
}
