import AdminPageHeader from "@/components/admin/admin-page-header"
import MediathequeManager from "@/components/admin/mediatheque/mediatheque-manager"
import { getAlbums, getPhotos } from "@/lib/gallery-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Médiathèque — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminMediathequePage() {
  await requireUserPage()
  const [albums, photos] = await Promise.all([getAlbums(), getPhotos()])

  return (
    <>
      <AdminPageHeader
        title="Médiathèque"
        subtitle="Album photo de la ville : les 8 premières photos s'affichent sur l'accueil, toutes sur la page Médiathèque"
      />
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <MediathequeManager
          initialAlbums={albums.map(({ id, name, slug }) => ({ id, name, slug }))}
          initialPhotos={photos}
        />
      </div>
    </>
  )
}
