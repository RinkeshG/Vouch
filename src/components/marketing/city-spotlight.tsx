import { Icon } from "@/components/ui/icon";
import styles from "./city-spotlight.module.css";

const cities = [
  { name: "Bangalore", active: true, label: "Live now" },
  { name: "Bombay", active: false, label: "Coming soon" },
  { name: "Delhi", active: false, label: "Coming soon" },
  { name: "Goa", active: false, label: "Coming soon" },
];

export function CitySpotlight() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>One city at a time</h2>
        <p className={styles.intro}>
          We go deep, not wide. Every neighbourhood, every local gem.
          We&rsquo;re starting where the food scene never sleeps.
        </p>

        <div className={styles.grid}>
          {cities.map((city) => (
            <div
              key={city.name}
              className={city.active ? styles.cardActive : styles.card}
            >
              <div className={styles.cardInner}>
                <Icon
                  name="map-pin"
                  size={20}
                  className={city.active ? styles.iconActive : styles.icon}
                />
                <span className={styles.cityName}>{city.name}</span>
              </div>
              <span
                className={
                  city.active ? styles.statusActive : styles.status
                }
              >
                {city.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
