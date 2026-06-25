"use client";

import { ClipcutLogo } from "./ClipcutLogo";

type PrivacyPolicyScreenProps = {
  onBack: () => void;
};

const privacySections = [
  {
    title: "1. Información que recopilamos",
    body: "En Clipcut recopilamos la información necesaria para crear y administrar tu cuenta, gestionar reservas y mejorar la experiencia dentro de la plataforma. Esta información puede incluir nombre, correo electrónico, teléfono, foto de perfil, ubicación aproximada, datos de reservas, servicios seleccionados, horarios y preferencias de uso.",
  },
  {
    title: "2. Uso de la información",
    body: "Utilizamos la información para permitir el funcionamiento de Clipcut, conectar clientes con peluqueros, confirmar reservas, mostrar disponibilidad, personalizar la experiencia, enviar comunicaciones relacionadas con el servicio, prevenir usos indebidos y mejorar la calidad de la aplicación.",
  },
  {
    title: "3. Información de ubicación",
    body: "Podemos solicitar acceso a tu ubicación para mostrar peluquerías cercanas y calcular distancias aproximadas. El uso de la ubicación es opcional y podés desactivarlo desde la configuración del dispositivo o navegador. Si no compartís tu ubicación, algunas funciones de cercanía pueden no estar disponibles.",
  },
  {
    title: "4. Reservas y pagos",
    body: "La información vinculada con reservas, servicios y pagos se utiliza únicamente para procesar, confirmar y administrar turnos dentro de Clipcut. Clipcut puede mostrar a cada parte la información estrictamente necesaria para coordinar la reserva, como nombre del cliente, servicio, horario y estado del turno.",
  },
  {
    title: "5. Compartir información con terceros",
    body: "No vendemos tus datos personales. Podemos compartir información con proveedores tecnológicos necesarios para operar Clipcut, como servicios de autenticación, base de datos, almacenamiento, analítica o procesamiento de pagos, siempre con el objetivo de prestar el servicio y bajo medidas razonables de seguridad.",
  },
  {
    title: "6. Seguridad",
    body: "Aplicamos medidas técnicas y organizativas razonables para proteger la información contra accesos no autorizados, pérdida, uso indebido o alteración. Sin embargo, ningún sistema digital es completamente infalible, por lo que recomendamos mantener tus credenciales seguras y notificarnos ante cualquier actividad sospechosa.",
  },
  {
    title: "7. Conservación de datos",
    body: "Conservamos la información durante el tiempo necesario para brindar el servicio, cumplir obligaciones legales, resolver disputas, prevenir fraude y mantener registros operativos. Cuando la información ya no sea necesaria, podremos eliminarla o anonimizarla de forma razonable.",
  },
  {
    title: "8. Derechos del usuario",
    body: "Podés solicitar acceso, corrección, actualización o eliminación de tus datos personales cuando corresponda. También podés cerrar tu cuenta desde las opciones disponibles en la aplicación o contactarnos para recibir asistencia relacionada con tus datos.",
  },
  {
    title: "9. Menores de edad",
    body: "Clipcut no está dirigida a menores que no cuenten con autorización suficiente para utilizar servicios digitales. Si detectamos que se creó una cuenta incumpliendo este requisito, podremos eliminarla y borrar la información asociada.",
  },
  {
    title: "10. Cambios en esta política",
    body: "Podemos actualizar esta Política de Privacidad para reflejar cambios en Clipcut, requisitos legales o mejoras operativas. Cuando los cambios sean relevantes, procuraremos informarlos dentro de la aplicación o por los medios de contacto disponibles.",
  },
  {
    title: "11. Contacto",
    body: "Si tenés preguntas sobre esta Política de Privacidad o sobre el tratamiento de tus datos, podés escribirnos a soporte@clipcutapp.com.",
  },
];

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <main className="min-h-dvh bg-zinc-100 px-3 py-4 text-zinc-950">
      <div className="mx-auto min-h-[calc(100dvh-2rem)] w-full max-w-[420px] overflow-hidden rounded-[2.25rem] bg-zinc-50 shadow-2xl shadow-zinc-950/10 ring-1 ring-zinc-200/80">
        <header className="sticky top-0 z-10 bg-white/95 px-4 pb-4 pt-5 shadow-sm shadow-zinc-950/5 backdrop-blur">
          <button
            className="mb-4 inline-flex h-10 items-center rounded-full bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-zinc-800 active:scale-[0.98]"
            onClick={onBack}
            type="button"
          >
            ← Volver
          </button>
          <div className="flex items-center justify-between gap-4">
            <ClipcutLogo className="h-12 w-auto object-contain" height={48} priority width={108} />
          </div>
          <h1 className="mt-5 text-3xl font-black leading-none tracking-[-0.06em] text-zinc-950">
            Política de Privacidad
          </h1>
        </header>

        <section className="grid gap-4 px-4 py-5">
          {privacySections.map((section) => (
            <article className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200/70" key={section.title}>
              <h2 className="text-base font-black tracking-[-0.03em] text-zinc-950">{section.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-zinc-600">{section.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
