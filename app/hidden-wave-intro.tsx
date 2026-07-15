import styles from "./hidden-wave-intro.module.css";

export type HiddenWaveIntroProps = {
  /** Mount with `true` when wave 200 has been completely cleared. */
  active: boolean;
  label: string;
  className?: string;
};

/**
 * A self-contained, 1.8 second reveal for the hidden wave.
 * Keep it mounted while `active` is true; toggling false -> true replays it.
 */
export default function HiddenWaveIntro({ active, label, className = "" }: HiddenWaveIntroProps) {
  if (!active) return null;

  return (
    <div
      className={`${styles.intro} ${className}`.trim()}
      role="alert"
      aria-label={label}
    >
      <div className={styles.blackout} />
      <div className={styles.shudder} aria-hidden="true">
        <div className={styles.vignette} />
        <div className={styles.portal}>
          <span className={styles.portalCore} />
          <span className={`${styles.crack} ${styles.crackOne}`} />
          <span className={`${styles.crack} ${styles.crackTwo}`} />
          <span className={`${styles.crack} ${styles.crackThree}`} />
          <span className={`${styles.crack} ${styles.crackFour}`} />
        </div>
        <div className={styles.warningSeal}>
          <span className={styles.runeRing}>◆　·　◆　·　◆　·　◆</span>
          <span className={styles.warningMark}>!</span>
        </div>
        <div className={styles.unknown}>{label}</div>
        <div className={styles.scanlines} />
      </div>
    </div>
  );
}
