import Link from 'next/link';
import styles from './index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.tiles}>
        <Link href="/book" className={styles.link}>
          <button className={styles.tile}>📖</button>
        </Link>
        <Link href="/reward" className={styles.link}>
          <button className={styles.tile}>💰</button>
        </Link>
      </div>
    </div>
  );
}
