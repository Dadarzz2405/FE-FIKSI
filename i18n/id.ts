/**
 * i18n/id.ts
 * 
 * Indonesian translations - the ONLY file you need to maintain.
 * English translations are auto-generated via MyMemory Translation API.
 */

const id = {
  // Common UI elements
  common: {
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    success: "Berhasil",
    cancel: "Batal",
    confirm: "Konfirmasi",
    save: "Simpan",
    edit: "Edit",
    delete: "Hapus",
    search: "Cari",
    filter: "Filter",
    sort: "Urutkan",
    back: "Kembali",
    next: "Selanjutnya",
    previous: "Sebelumnya",
    close: "Tutup",
    open: "Buka",
    yes: "Ya",
    no: "Tidak",
  },

  // Navigation
  nav: {
    home: "Beranda",
    about: "Tentang",
    contact: "Kontak",
    profile: "Profil",
    settings: "Pengaturan",
    logout: "Keluar",
    login: "Masuk",
    register: "Daftar",
  },

  // Authentication
  auth: {
    login: {
      title: "Masuk ke Akun",
      email: "Email",
      password: "Kata Sandi",
      forgotPassword: "Lupa kata sandi?",
      loginButton: "Masuk",
      noAccount: "Belum punya akun?",
      signUp: "Daftar sekarang",
    },
    register: {
      title: "Buat Akun Baru",
      name: "Nama Lengkap",
      email: "Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      registerButton: "Daftar",
      hasAccount: "Sudah punya akun?",
      signIn: "Masuk di sini",
    },
    errors: {
      invalidEmail: "Email tidak valid",
      passwordTooShort: "Kata sandi minimal 6 karakter",
      passwordMismatch: "Kata sandi tidak cocok",
      loginFailed: "Email atau kata sandi salah",
      registrationFailed: "Pendaftaran gagal",
    },
  },

  // Dashboard/Home
  dashboard: {
    welcome: "Selamat datang",
    overview: "Ringkasan",
    recentActivity: "Aktivitas Terbaru",
    quickActions: "Aksi Cepat",
    statistics: "Statistik",
  },

  // Forms
  forms: {
    required: "Wajib diisi",
    optional: "Opsional",
    pleaseSelect: "Silakan pilih",
    selectOption: "Pilih opsi",
    uploadFile: "Unggah file",
    dragDropFile: "Seret dan lepas file di sini",
    maxFileSize: "Ukuran file maksimal",
    allowedFormats: "Format yang diizinkan",
  },

  // Messages
  messages: {
    saveSuccess: "Data berhasil disimpan",
    deleteSuccess: "Data berhasil dihapus",
    updateSuccess: "Data berhasil diperbarui",
    deleteConfirm: "Apakah Anda yakin ingin menghapus item ini?",
    unsavedChanges: "Ada perubahan yang belum disimpan",
    networkError: "Koneksi internet bermasalah",
    serverError: "Terjadi kesalahan pada server",
    notFound: "Data tidak ditemukan",
    accessDenied: "Akses ditolak",
  },

  // Time and dates
  time: {
    now: "Sekarang",
    today: "Hari ini",
    yesterday: "Kemarin",
    tomorrow: "Besok",
    thisWeek: "Minggu ini",
    lastWeek: "Minggu lalu",
    thisMonth: "Bulan ini",
    lastMonth: "Bulan lalu",
    thisYear: "Tahun ini",
    lastYear: "Tahun lalu",
  },

  // Language toggle
  language: {
    switchToEnglish: "Switch to English",
    switchToIndonesian: "Ganti ke Bahasa Indonesia",
    translating: "Menerjemahkan...",
  },
} as const

export type TranslationKeys = typeof id
export default id