import Home from "../../page";

type PublicBarberPageProps = {
  params: Promise<{ barberId: string }>;
};

export default async function PublicBarberPage({ params }: PublicBarberPageProps) {
  const { barberId } = await params;

  return <Home publicBarberId={barberId} />;
}
