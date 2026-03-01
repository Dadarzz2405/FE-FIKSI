import styles from "../coming-soon.module.css"

export default function SettingsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pengaturan</h1>
        <p className={styles.subtitle}>Fitur pengaturan sedang disiapkan.</p>
      </div>

      <section className={styles.card}>
        <p className={styles.badge}>coming_soon</p>
        <h2 className={styles.message}>Settings endpoints are coming soon.</h2>
      </section>
    </main>
  )
}
