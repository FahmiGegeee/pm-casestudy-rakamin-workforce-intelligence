# PM Case Study - Rakamin Workforce Intelligence Platform

## 🌐 Live Demo
👉 https://pm-casestudy-rakamin-mfahmigg.netlify.app/

## 📋 Project Overview

Ini adalah case study untuk merancang **Workforce Intelligence Platform** – solusi yang mengubah data HR yang terfragmentasi dan tidak konsisten menjadi insight yang dapat digunakan untuk pengambilan keputusan strategis.

Fokus utama bukan hanya pada penggunaan AI, tetapi pada bagaimana membangun **fondasi data yang kuat** agar insight yang dihasilkan menjadi akurat, relevan, dan dapat dipercaya.

**Status:** Proof of Concept (PoC) - Fitur utama telah selesai dikembangkan untuk mendemonstrasikan solusi.

---

## 🎯 Tujuan Utama

1. ✅ Mengidentifikasi permasalahan utama dalam pengelolaan data workforce di perusahaan
2. ✅ Membangun strategi data untuk mengatasi data yang tidak lengkap dan tidak terintegrasi
3. ✅ Mengembangkan solusi berbasis AI untuk menghasilkan insight terkait skill gap dan kebutuhan reskilling
4. ✅ Mendesain interface produk yang mudah digunakan oleh HR manager
5. ✅ Menyusun roadmap pengembangan produk dalam jangka waktu 90 hari
6. ✅ Merancang solusi agar dapat dikembangkan menjadi platform yang scalable dan reusable

---

## 🔴 Scope & Challenges

### Tantangan Utama
- **Data Gaps:** Sekitar 40% missing skill data pada profil karyawan
- **Inkonsistensi Job Title:** Ketidakkonsistenan job title antar cabang
- **Fragmented Systems:** Tidak ada unique employee ID yang konsisten antar sistem
- **Unreliable Historical Data:** Data historis performa yang tidak reliable
- **Regulatory Constraints:** Tidak adanya akses ke data payroll karena keterbatasan regulasi
- **Time Constraint:** Kebutuhan untuk menghasilkan insight dalam waktu singkat (90 hari)

### Scope Project
Project difokuskan pada pembangunan solusi awal (Proof of Concept) yang dapat menunjukkan value dari pendekatan data-driven decision.

---

## 💡 Solusi & Approach

### Data Pipeline & Processing
- Membangun data pipeline untuk ingestion, cleaning, dan standardization data
- Melakukan identity resolution untuk menggabungkan data karyawan dari berbagai sistem
- Implementasi confidence scoring untuk mengukur tingkat kepercayaan terhadap data dan output model

### AI & Analytics
- Mengembangkan model AI sederhana untuk analisis skill gap dan rekomendasi reskilling
- Membandingkan hasil antara messy data dan clean data untuk menunjukkan dampak dari data processing

### User Interface
- Mendesain decision interface yang membantu HR manager mengambil keputusan tanpa perlu memahami kompleksitas teknis
- Focus pada usability dan actionable insights

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | JavaScript (64.8%), HTML (7.7%), CSS (27.5%) |
| **Framework** | React / Vanilla JS |
| **Styling** | CSS3 / Responsive Design |
| **Data Processing** | Python (Backend) / JavaScript (Frontend) |
| **Analytics** | Data visualization libraries |
| **Version Control** | Git & GitHub |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ atau lebih baru
- npm atau yarn
- Browser modern (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone repository
git clone https://github.com/FahmiGegeee/pm-casestudy-rakamin-workforce-intelligence.git

# Navigate to project directory
cd pm-casestudy-rakamin-workforce-intelligence

# Install dependencies
npm install

# atau jika menggunakan yarn
yarn install
```

### Running the Application

```bash
# Development mode
npm start

# atau
yarn start

# Build for production
npm run build

# atau
yarn build
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 📊 Key Features

### 1. **Data Dashboard**
   - Visualisasi data workforce terkini
   - Confidence scoring untuk setiap data point
   - Perbandingan antara messy data vs clean data

### 2. **Skill Gap Analysis**
   - Identifikasi skill gap per employee
   - Analisis gap di level departemen/cabang
   - Rekomendasi reskilling berbasis AI

### 3. **Employee Intelligence**
   - Profil lengkap employee dengan data quality indicator
   - Matching antara skill dengan job requirements
   - Prediksi kebutuhan reskilling

### 4. **Decision Support Interface**
   - Insight yang actionable untuk HR Manager
   - Rekomendasi berbasis data dengan confidence level
   - Export reports untuk stakeholder

---

## 📈 Project Roadmap (90 Days)

### Phase 1: Foundation (Days 1-30)
- ✅ Problem analysis & validation
- ✅ Data strategy formulation
- ✅ Architecture design
- ✅ Data pipeline setup

### Phase 2: Core Features (Days 31-60)
- ✅ Data ingestion & cleaning
- ✅ Identity resolution implementation
- ✅ Skill gap model development
- ✅ Frontend components development

### Phase 3: Polish & Deployment (Days 61-90)
- ✅ Integration & testing
- ✅ UI/UX refinement
- ✅ Performance optimization
- ✅ Documentation & deployment

---

## 👤 About This Project

**Dikembangkan oleh:** Muhammad Fahmi Gymnastiar Gozali (Product Manager)

Project ini dikembangkan secara individu sebagai bagian dari **portfolio Product Manager**, mendemonstrasikan kemampuan dalam:
- Problem analysis & strategy formulation
- Data-driven decision making
- Product design & user experience
- Technical collaboration & project management

---

## 🔄 Data Processing Pipeline

```
Raw Data (Multiple Systems)
         ↓
   Data Ingestion
         ↓
   Data Cleaning & Standardization
         ↓
   Identity Resolution
         ↓
   Confidence Scoring
         ↓
   AI Model Processing
         ↓
   Decision Interface & Insights
```

---

## 🎓 Key Learnings & Insights

### Data Quality Matters
Dampak signifikan dari data quality terhadap akurasi model dan kepercayaan stakeholder.

### Identity Resolution is Critical
Menggabungkan data dari multiple systems memerlukan pendekatan yang sophisticated dan robust.

### Confidence Scoring Builds Trust
Transparansi tentang data quality dan model confidence membantu HR Manager membuat keputusan yang lebih informed.

### User-Centric Design
Interface yang simple dan actionable insights lebih valuable daripada model yang kompleks tapi sulit dipahami.

---

## 🤝 Contributing

Project ini merupakan case study individual, namun feedback dan saran sangat diterima. Silakan buka issue atau discussion untuk berbagi feedback.

---

## 📄 License

Project ini open untuk educational purposes.

---

## 📞 Contact & Feedback

Untuk pertanyaan atau feedback mengenai project ini:
- 📧 GitHub: [@FahmiGegeee](https://github.com/FahmiGegeee)
- 💼 Portfolio & Details: Lihat repository ini untuk dokumentasi lengkap

---

**Last Updated:** 2026-04-19 05:14:09
**Project Status:** Proof of Concept (PoC) - Production Ready for Phase 1
