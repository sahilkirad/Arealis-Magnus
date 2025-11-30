import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./card.module.css";

type NativeCardProps = ComponentPropsWithoutRef<"section">;

interface CardProps extends Omit<NativeCardProps, "children"> {
  dense?: boolean;
  children: ReactNode;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({
  className,
  dense,
  onClick,
  role,
  tabIndex,
  children,
  ...props
}: PropsWithChildren<CardProps>) {
  const isInteractive = typeof onClick === "function";
  const computedRole = role ?? (isInteractive ? "button" : undefined);
  const needsTabIndex = isInteractive && (!computedRole || computedRole === "button");
  const computedTabIndex = tabIndex ?? (needsTabIndex ? 0 : undefined);

  return (
    <section
      className={cn(styles.card, dense && styles.cardDense, isInteractive && styles.cardInteractive, className)}
      onClick={onClick}
      role={computedRole}
      tabIndex={computedTabIndex}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <header className={styles.cardHeader}>
      <div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function CardDivider() {
  return <hr className={styles.cardDivider} />;
}


