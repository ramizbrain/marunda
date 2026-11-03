import icon from "../../assets/icon-on-dark.png";
import logo from "../../assets/logo-on-dark.png";

interface BrandMarkProps {
  className?: string;
}

export function BrandLogo({ className }: BrandMarkProps) {
  return <img className={className} src={logo} alt="Marunda" draggable={false} />;
}

export function BrandIcon({ className }: BrandMarkProps) {
  return <img className={className} src={icon} alt="" aria-hidden="true" draggable={false} />;
}
