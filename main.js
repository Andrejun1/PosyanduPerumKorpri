 function posyanduApp() {
            return {
                // Supabase configuration - GANTI DENGAN KREDENSIAL ANDA
                supabaseUrl: 'https://qihjcmfzjpzyviefpimx.supabase.co',
                supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaGpjbWZ6anB6eXZpZWZwaW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY3MTcsImV4cCI6MjA2NDQ1MjcxN30.vTITIVv7hCdXtvAdipoYf90-8B9LEbcYRCebGCoOXPQ',
                supabase: null,

                // State
                schedules: [],
                loading: true,
                isAdmin: false,
                showAdminLogin: false,
                showAddSchedule: false,
                editingSchedule: null,
                adminPassword: '',
                loggingIn: false,
                saving: false,
                alert: {
                    show: false,
                    message: '',
                    type: 'success'
                },
                scheduleForm: {
                    date: '',
                    time_start: '',
                    time_end: '',
                    activity: '',
                    location: '',
                    description: ''
                },

                init() {
                    // Initialize Supabase
                    if (this.supabaseUrl && this.supabaseKey && this.supabaseUrl !== 'YOUR_SUPABASE_URL') {
                        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
                        this.loadSchedules();
                    } else {
                        // Demo data if Supabase not configured
                        setTimeout(() => {
                            this.schedules = [
                                {
                                    id: 1,
                                    date: '2025-06-10',
                                    time_start: '08:00',
                                    time_end: '10:00',
                                    activity: 'Imunisasi Balita',
                                    location: 'Balai Desa Semarang',
                                    description: 'Imunisasi rutin untuk balita usia 0-5 tahun'
                                },
                                {
                                    id: 2,
                                    date: '2025-06-15',
                                    time_start: '09:00',
                                    time_end: '11:00',
                                    activity: 'Pemeriksaan Ibu Hamil',
                                    location: 'Puskesmas Kelurahan',
                                    description: 'Pemeriksaan kesehatan rutin untuk ibu hamil'
                                },
                                {
                                    id: 3,
                                    date: '2025-06-20',
                                    time_start: '15:00',
                                    time_end: '17:00',
                                    activity: 'Penyuluhan Gizi',
                                    location: 'Aula Posyandu',
                                    description: 'Edukasi tentang gizi seimbang untuk keluarga'
                                }
                            ];
                            this.loading = false;
                        }, 1000);
                    }
                },

                async loadSchedules() {
                    try {
                        this.loading = true;
                        const { data, error } = await this.supabase
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
                    
                    // Simple password check - in production, use proper authentication
                    if (this.adminPassword === 'andre12') {
                        this.isAdmin = true;
                        this.showAdminLogin = false;
                        this.adminPassword = '';
                        this.showAlert('Login berhasil!', 'success');
                    } else {
                        this.showAlert('Password salah!', 'error');
                    }
                    
                    this.loggingIn = false;
                },

                logout() {
                    this.isAdmin = false;
                    this.showAlert('Logout berhasil!', 'success');
                },

                async saveSchedule() {
                    try {
                        this.saving = true;
                        
                        // Validasi waktu
                        if (this.scheduleForm.time_start >= this.scheduleForm.time_end) {
                            this.showAlert('Waktu mulai harus lebih awal dari waktu selesai!', 'error');
                            this.saving = false;
                            return;
                        }
                        
                        if (this.supabase) {
                            if (this.editingSchedule) {
                                const { error } = await this.supabase
                                    .from('schedules')
                                    .update(this.scheduleForm)
                                    .eq('id', this.editingSchedule.id);
                                
                                if (error) throw error;
                                this.showAlert('Jadwal berhasil diupdate!', 'success');
                            } else {
                                const { error } = await this.supabase
                                    .from('schedules')
                                    .insert([this.scheduleForm]);
                                
                                if (error) throw error;
                                this.showAlert('Jadwal berhasil ditambahkan!', 'success');
                            }
                            
                            await this.loadSchedules();
                        } else {
                            // Demo mode
                            if (this.editingSchedule) {
                                const index = this.schedules.findIndex(s => s.id === this.editingSchedule.id);
                                this.schedules[index] = { ...this.scheduleForm, id: this.editingSchedule.id };
                            } else {
                                this.schedules.push({
                                    ...this.scheduleForm,
                                    id: Date.now()
                                });
                            }
                            this.showAlert('Jadwal berhasil disimpan! (Mode Demo)', 'success');
                        }
                        
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
                        if (this.supabase) {
                            const { error } = await this.supabase
                                .from('schedules')
                                .delete()
                                .eq('id', id);
                            
                            if (error) throw error;
                            await this.loadSchedules();
                        } else {
                            // Demo mode
                            this.schedules = this.schedules.filter(s => s.id !== id);
                        }
                        
                        this.showAlert('Jadwal berhasil dihapus!', 'success');
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
                        description: ''
                    };
                },

                formatDate(dateString) {
                    const options = { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    };
                    return new Date(dateString).toLocaleDateString('id-ID', options);
                },

                showAlert(message, type = 'success') {
                    this.alert = { show: true, message, type };
                    setTimeout(() => {
                        this.alert.show = false;
                    }, 5000);
                }
            }
        }