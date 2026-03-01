import styles from "../coming-soon.module.css"

export default function QuizzesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kuis</h1>
        <p className={styles.subtitle}>Fitur kuis sedang disiapkan.</p>
      </div>

      <section className={styles.card}>
        <p className={styles.badge}>coming_soon</p>
        <h2 className={styles.message}>Quizzes endpoints are coming soon.</h2>
      </section>
    </main>
  )
}
