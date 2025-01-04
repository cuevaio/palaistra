import { BadgeDollarSignIcon, Users2Icon, type LucideIcon } from 'lucide-react';

const MetricCard = ({
  header,
  icon,
  value,
  footer,
}: {
  header: string;
  icon: LucideIcon;
  value: string;
  footer: string;
}) => {
  const Icon = icon;
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium tracking-tight">{header}</p>
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-3xl font-black">{value}</p>
        <p className="mt-2 text-xs">{footer}</p>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <div className="container mx-auto my-8">
      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          header="Alumnos activos"
          icon={Users2Icon}
          value="106"
          footer="10 más que el mes pasado"
        />
        <MetricCard
          header="Ingresos"
          icon={BadgeDollarSignIcon}
          value="S/ 13,560.00"
          footer="S/ 2,540.00 más que el mes pasado"
        />
        <MetricCard
          header="Alumnos activos"
          icon={Users2Icon}
          value="106"
          footer="10 más que el mes pasado"
        />
        <MetricCard
          header="Alumnos activos"
          icon={Users2Icon}
          value="106"
          footer="10 más que el mes pasado"
        />
      </div>
    </div>
  );
}
