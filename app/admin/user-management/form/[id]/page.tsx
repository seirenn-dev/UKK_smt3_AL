import { Suspense } from "react"
import { UserForm } from "../user-form"

type EditUserPageProps = {
  params: Promise<{ id: string }>
}

async function EditUserContent({ params }: EditUserPageProps) {
  const { id } = await params
  return <UserForm userId={id} />
}

export default function EditUserPage({ params }: EditUserPageProps) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Memuat form...</p>}>
      <EditUserContent params={params} />
    </Suspense>
  )
}