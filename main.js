// ✅ Konfigurasi Supabase
const SUPABASE_URL = 'https://qihjcmfzjpzyviefpimx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaGpjbWZ6anB6eXZpZWZwaW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY3MTcsImV4cCI6MjA2NDQ1MjcxN30.vTITIVv7hCdXtvAdipoYf90-8B9LEbcYRCebGCoOXPQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function posyanduApp() {
  return {
    // 🔧 State utama
    schedules: [],
    loading: true,
    isAdmin: false,
    showAdminLogin: false,
    showAddSchedule: false,
    editingSchedule: null,
    adminEmail: '', // jika mau pakai input email
    adminPassword: '',
    loggingIn: false,
    saving: false,
    menuOpen: false,
    menuOpen: window.innerWidth >= 768,

    alert: {
      show: false,
      message: '',
      type: 'success',
    },

    scheduleForm: {
      date: '',
      time_start: '',
      time_end: '',
      activity: '',
      location: '',
      description: '',
    },

    // 🚀 Jalankan saat halaman dimuat
    init() {
      this.loadSchedules();
    },

    showAlert(message, type = 'success') {
      this.alert = { show: true, message, type };
      setTimeout(() => (this.alert.show = false), 4000);
    },

    formatDate(dateStr) {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    },

    async loadSchedules() {
      try {
        this.loading = true;
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;
        this.schedules = data || [];
      } catch (error) {
        this.showAlert('Gagal memuat jadwal: ' + error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    async adminLogin() {
      this.loggingIn = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@email.com', // 🔒 Sesuaikan dengan akun admin kamu
        password: this.adminPassword,
      });

      if (error) {
        this.showAlert('Login gagal: ' + error.message, 'error');
      } else {
        this.isAdmin = true;
        this.showAdminLogin = false;
        this.adminPassword = '';
        this.showAlert('Login berhasil!', 'success');
      }

      this.loggingIn = false;
    },

    async logout() {
      await supabase.auth.signOut();
      this.isAdmin = false;
      this.showAlert('Logout berhasil!', 'success');
    },

    async saveSchedule() {
      try {
        this.saving = true;

        if (this.scheduleForm.time_start >= this.scheduleForm.time_end) {
          this.showAlert('Waktu mulai harus lebih awal dari waktu selesai!', 'error');
          this.saving = false;
          return;
        }

        if (this.editingSchedule) {
          const { error } = await supabase
            .from('schedules')
            .update(this.scheduleForm)
            .eq('id', this.editingSchedule.id);

          if (error) throw error;
          this.showAlert('Jadwal berhasil diupdate!', 'success');
        } else {
          const { error } = await supabase
            .from('schedules')
            .insert([this.scheduleForm]);

          if (error) throw error;
          this.showAlert('Jadwal berhasil ditambahkan!', 'success');
        }

        await this.loadSchedules();
        this.closeScheduleModal();
      } catch (error) {
        this.showAlert('Gagal menyimpan jadwal: ' + error.message, 'error');
      } finally {
        this.saving = false;
      }
    },

    async deleteSchedule(id) {
      if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

      try {
        const { error } = await supabase
          .from('schedules')
          .delete()
          .eq('id', id);

        if (error) throw error;

        this.showAlert('Jadwal berhasil dihapus!', 'success');
        await this.loadSchedules();
      } catch (error) {
        this.showAlert('Gagal menghapus jadwal: ' + error.message, 'error');
      }
    },

    editSchedule(schedule) {
      this.editingSchedule = schedule;
      this.scheduleForm = { ...schedule };
      this.showAddSchedule = true;
    },

    closeScheduleModal() {
      this.showAddSchedule = false;
      this.editingSchedule = null;
      this.scheduleForm = {
        date: '',
        time_start: '',
        time_end: '',
        activity: '',
        location: '',
        description: '',
      };
    },
  };
}

function carousel() {
            return {
                currentSlide: 0,
                totalSlides: 4,
                autoSlideInterval: null,

                init() {
                    this.startAutoSlide();
                },

                nextSlide() {
                    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                    this.resetAutoSlide();
                },

                prevSlide() {
                    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
                    this.resetAutoSlide();
                },

                startAutoSlide() {
                    this.autoSlideInterval = setInterval(() => {
                        this.nextSlide();
                    }, 5000);
                },

                resetAutoSlide() {
                    clearInterval(this.autoSlideInterval);
                    this.startAutoSlide();
                }
            }
        }

        // Smooth scrolling for navigation links
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        });
