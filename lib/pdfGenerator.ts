import { formatDateID } from "./formatDate";

export function generateVehicleHTML(data: any) {
  // Format Tanggal Indonesia (misal: RABU, 29 OKTOBER 2025)
  const dateObj = new Date(data.createdAt);
  const dateString = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const shortDate = dateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-"); // Format: 29-OKTOBER-25

  const kirDueDateObj = new Date(data.asset?.vehicle?.kir_due_date);
  const kirShortDate = kirDueDateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-");

  const stnkDueDateObj = new Date(data.asset?.vehicle?.stnk_due_date);
  const stnkShortDate = stnkDueDateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-");

  const sparepartsHTML = data.spareparts.length
    ? data.spareparts
        .map((item: any) => {
          return `
          <div>
            ${item.sparepart.code} - ${item.sparepart.name}
            (${item.total} ${item.sparepart.unit})
          </div>
        `;
        })
        .join("")
    : "<div>Tidak ada sparepart</div>";

  const galleryImages = data.images.slice(0, 3);
  const footerImage = data.asset_image_url;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 0; }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
          padding: 20px;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
        }

        /* ======================= */
        /*  TABLE-CLEAN (NO BORDER) */
        /* ======================= */
        .table-clean {
          width: 100%;
          border-collapse: collapse;
        }

        .table-clean td {
          border: none !important;
          padding: 2px 0;
          font-size: 10px;
        }

        .table-clean td.label {
          width: 180px;
          text-align: left;
          padding-right: 10px;
          white-space: nowrap;
        }

        .table-clean td.separator {
          width: 10px;
          text-align: center;
        }

        .table-clean td.value {
          width: auto;
          text-align: left;
        }

        /* Utility Classes */
        .bold { font-weight: bold; }
        .center { text-align: center; }
        .uppercase { text-transform: uppercase; }
        .w-100 { width: 100%; }
        
        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        td, th {
          border: 1px solid black;
          padding: 4px 2px;
          vertical-align: top;
          font-size: 10px;
        }

        /* Header Specifics */
        .header-table td { padding: 0; border: 1px solid black; }
        .logo-cell { width: 100px; text-align: center; vertical-align: middle; padding: 5px; }
        .title-cell { text-align: center; vertical-align: middle; }
        .meta-table { width: 100%; border: none; margin: 0; }
        .meta-table td { border: none; border-bottom: 1px solid black; border-left: 1px solid black; padding: 2px 2px; font-size: 10px; }
        .meta-table tr:last-child td { border-bottom: none; }

        /* Main Title */
        h1.main-title {
          text-align: center;
          text-decoration: underline;
          font-size: 14px;
          font-weight: bold;
          margin: 12px 0;
          text-transform: uppercase;
        }

        /* Sections */
        .section-box {
          border: 1px solid black;
          margin-bottom: -1px;
          padding: 5px;
        }
        
        .section-header {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
          display: inline-block;
        }

        /* Lists */
        ol, ul { margin: 5px 0 5px 20px; padding: 0; }
        li { margin-bottom: 2px; }

        /* Image Gallery */
        .date-badge {
          background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
          border: 1px solid black;
          padding: 5px 16px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          width: fit-content;
          margin: 8px auto;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
          border-radius: 4px;
        }

       .gallery-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 10px 0;
        }

        .photo-frame {
            background-color: white;
            padding: 0;
            border: 4px solid #FFD700;
            box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
            width: 100%;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Footer / Signatures */
        .footer-container {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 15px;
        }

        .signature-table {
          width: 100%;
          border: 1px solid black;
        }
        
        .signature-header {
          background-color: #FFFF00;
          font-weight: bold;
          text-align: center;
          padding: 5px;
          border-bottom: 1px solid black;
        }

        .signature-box {
          height: 80px;
          text-align: center;
          vertical-align: bottom;
        }
        
        .footer-image-frame {
           border: 4px solid #FFD700;
           box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
           width: 160px;
           height: 200px;
           overflow: hidden;
        }
        
        .footer-image-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
      </style>
    </head>

    <body>

      <table class="header-table">
        <tr>
          <td class="logo-cell" rowspan="2">
             <img src="https://www.pt-aau.com/wp-content/uploads/2025/05/logo-circle.png"
                  width="80" height="80" alt="Logo PT AAU" />
          </td>
          
          <td class="title-cell">
            <div style="font-size: 14px; font-weight: bold;">PT.ADITYA ANDHIKA UTAMA</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">LAPORAN KEGIATAN</div>
          </td>

          <td style="width: 250px; padding:0;">
            <table class="meta-table">
              <tr>
                <td width="100">No. Dokumen</td>
                <td>: ${data.record_number}</td>
              </tr>
              <tr>
                <td>Tanggal Kegiatan</td>
                <td>: ${shortDate}</td>
              </tr>
              <tr>
                <td>Revisi</td>
                <td>: </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 5px; font-weight: bold; vertical-align: middle; border-right: 1px solid black;">
            &nbsp; Departemen &nbsp; : HSE
          </td>
          <td style="padding:0;">
             <table class="meta-table">
              <tr>
                <td width="100">Tanggal Revisi</td>
                <td>: -</td>
              </tr>
              <tr>
                <td>Halaman</td>
                <td>: 1</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <h1 class="main-title">LAPORAN KEGIATAN SERVICE KENDARAAN</h1>

      <div style="border: 1px solid black;">

        <!-- =========================== -->
        <!-- A. TUJUAN -->
        <!-- =========================== -->
       <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">A. Tujuan Kegiatan :</span>
          <div style="font-size: 10px; margin-bottom: 5px;">
            Untuk menjaga performa, keamanan, dan keandalan kendaraan agar tetap optimal. Berikut adalah beberapa tujuan spesifik dari kegiatan service kendaraan:
          </div>
          
          <ol style="column-count: 2; column-gap: 20px; margin: 0 0 5px 20px; font-size: 10px;">
            <li><span class="bold">Memastikan Keamanan Berkendara</span></li>
            <li><span class="bold">Memperpanjang Umur Pakai Kendaraan</span></li>
            <li><span class="bold">Mengoptimalkan Performa Kendaraan</span></li>
            <li><span class="bold">Mencegah Kerusakan yang Lebih Parah</span></li>
            <li><span class="bold">Memenuhi Standar Emisi</span></li>
            <li><span class="bold">Menjaga Nilai Jual Kendaraan</span></li>
            <li><span class="bold">Menghemat Biaya Operasional</span></li>
            <li><span class="bold">Memastikan Kenyamanan Berkendara</span></li>
            <li><span class="bold">Memenuhi Kewajiban Garansi</span></li>
            <li><span class="bold">Mencegah Gangguan di Jalan</span></li>
          </ol>

          <div style="font-size: 10px;">
            Dengan melakukan service kendaraan secara berkala, pengguna dapat menikmati kendaraan yang aman, nyaman, dan andal dalam jangka panjang.
          </div>
        </div>

        <!-- =========================== -->
        <!-- B. PENANGGUNG JAWAB -->
        <!-- =========================== -->
        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">B. Penanggung Jawab Kegiatan :</span>
          <ul style="font-size: 10px; margin: 0 0 5px 20px; padding: 0;">
            <li>Petugas Safety</li>
            <li>TEAM Mekanik</li>
            <li>Direktur & Koordinator Safety</li>
          </ul>
        </div>

        <!-- =========================== -->
        <!-- C. PPE -->
        <!-- =========================== -->
        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">C. Peralatan Pelindung Diri (PPE) :</span>
          <div>APD</div>
        </div>

        <!-- =========================== -->
        <!-- D. DATA KENDARAAN (REVISED) -->
        <!-- =========================== -->
        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
           <div style="display: flex; gap: 24px; align-items: flex-start;">
              <div style="flex: 1;">
                <span class="section-header">D. Data Kendaraan :</span>
                <table class="table-clean">
                    <tr>
                        <td class="label">Nomor Plat</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.vehicle?.license_plate}</td>
                    </tr>
                    <tr>
                        <td class="label">Kilometer</td>
                        <td class="separator">:</td>
                        <td class="value">${data.km_asset} KM</td>
                    </tr>
                    <tr>
                        <td class="label">Nomor Rangka</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.vehicle?.frame_number}</td>
                    </tr>
                    <tr>
                        <td class="label">Nomor Mesin</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.vehicle?.engine_number}</td>
                    </tr>
                </table>
              </div>
              <div style="flex: 1;">
              <span class="section-header"></span>
              <table class="table-clean">
                  <tr>
                      <td class="label">Tanggal Akhir STNK</td>
                      <td class="separator">:</td>
                      <td class="value">${stnkShortDate}</td>
                  </tr>
                  <tr>
                      <td class="label">Tanggal Akhir KIR</td>
                      <td class="separator">:</td>
                      <td class="value">${kirShortDate}</td>
                  </tr>
                  <tr>
                      <td class="label">Catatan</td>
                      <td class="separator">:</td>
                      <td class="value">${data.asset?.vehicle?.notes}</td>
                  </tr>
              </table>
              </div>
           </div>
        </div>

        <!-- =========================== -->
        <!-- E. DATA DRIVER (REVISED) -->
        <!-- =========================== -->
        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <div style="display: flex; gap: 24px; align-items: flex-start;">

            <!-- KIRI -->
            <div style="flex: 1;">
              <span class="section-header">E. Data Driver :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Nomor Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.driver_number}</td>
                </tr>
                <tr>
                  <td class="label">Nama Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.name}</td>
                </tr>
                <tr>
                  <td class="label">Nomor HP</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.phone}</td>
                </tr>
                  <tr>
                  <td class="label">Tanggal Kadaluarsa SIM</td>
                  <td class="separator">:</td>
                  <td class="value">
                    ${formatDateID(data.driver?.sim_due_date) ?? "-"}
                  </td>
                </tr>
              </table>
            </div>

            <!-- KANAN -->
            <div style="flex: 1;">
              <span class="section-header">F. Kegiatan :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Keluhan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.complaint}</td>
                </tr>
                <tr>
                  <td class="label">Catatan Perbaikan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.repair_notes}</td>
                </tr>
                <tr>
                  <td class="label">Spareparts</td>
                  <td class="separator">:</td>
                  <td class="value">${sparepartsHTML}</td>
                </tr>
              </table>
            </div>

          </div>
        </div>


        <!-- =========================== -->
        <!-- F. KEGIATAN -->
        <!-- =========================== -->

        <!-- =========================== -->
        <!-- G. DOKUMENTASI -->
        <!-- =========================== -->
        <div class="section-box" style="border: none; border-bottom: 1px solid black; min-height: 200px;">
          <span class="section-header">G. Dokumentasi Kegiatan:</span>
          
          <div class="date-badge">${dateString}</div>

          <div class="gallery-container">
            ${galleryImages
              .map(
                (img: any) => `
              <div class="photo-frame">
                <img src="${img.url}" />
              </div>
            `
              )
              .join("")}

            ${
              galleryImages.length === 0
                ? '<div style="padding:20px; text-align:center;">Tidak ada dokumentasi foto</div>'
                : ""
            }
          </div>
        </div>

        <!-- =========================== -->
        <!-- H. LOKASI -->
        <!-- =========================== -->
        <div class="section-box" style="border: none;">
          <span class="section-header">H. Lokasi Kegiatan :</span>
          <div>${data.location ?? "Warehouse"}</div>
        </div>

      </div>

      <!-- =========================== -->
      <!-- FOOTER (TTD + FOTO) -->
      <!-- =========================== -->
      <div class="footer-container">
        
        <div style="flex: 1;">
          <table class="signature-table">
            <thead>
              <tr>
                <th class="signature-header" style="width: 33%;">Dilakukan oleh :</th>
                <th class="signature-header" style="width: 33%;">Dilaporkan oleh :</th>
                <th class="signature-header" style="width: 33%;">Disetujui oleh :</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="signature-box">
                  <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${
                    data.done_by
                  }</span><br>
                  (Mekanik)
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${data.user?.fullname}</span><br>
                  (${data.user?.role})
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">Aditya Putra</span><br>
                  (Direktur & Koordinator safety)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        ${
          footerImage
            ? `
        <div class="footer-image-frame">
          <img src="${footerImage}" />
        </div>
        `
            : ""
        }

      </div>

    </body>
  </html>
  `;
}

export function generateChassisHTML(data: any) {
  // Format Tanggal Indonesia (misal: RABU, 29 OKTOBER 2025)
  const dateObj = new Date(data.createdAt);
  const dateString = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const shortDate = dateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-"); // Format: 29-OKTOBER-25

  const kirDueDateObj = new Date(data.asset?.chassis?.kir_due_date);
  const kirShortDate = kirDueDateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-");

  const sparepartsHTML = data.spareparts.length
    ? data.spareparts
        .map((item: any) => {
          return `
          <div>
            ${item.sparepart.code} - ${item.sparepart.name}
            (${item.total} ${item.sparepart.unit})
          </div>
        `;
        })
        .join("")
    : "<div>Tidak ada sparepart</div>";

  const galleryImages = data.images.slice(0, 3);
  const footerImage = data.asset_image_url;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 0; }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
          padding: 20px;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
        }

        .table-clean {
          width: 100%;
          border-collapse: collapse;
        }

        .table-clean td {
          border: none !important;
          padding: 2px 0;
          font-size: 10px;
        }

        .table-clean td.label {
          width: 140px;
          text-align: left;
          padding-right: 5px;
          white-space: nowrap;
        }

        .table-clean td.separator {
          width: 10px;
          text-align: center;
        }

        .table-clean td.value {
          width: auto;
          text-align: left;
        }

        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        td, th {
          border: 1px solid black;
          padding: 4px 2px;
          vertical-align: top;
          font-size: 10px;
        }

        .header-table td { padding: 0; border: 1px solid black; }
        .logo-cell { width: 100px; text-align: center; vertical-align: middle; padding: 5px; }
        .title-cell { text-align: center; vertical-align: middle; }
        .meta-table { width: 100%; border: none; margin: 0; }
        .meta-table td { border: none; border-bottom: 1px solid black; border-left: 1px solid black; padding: 2px 2px; font-size: 10px; }
        .meta-table tr:last-child td { border-bottom: none; }

        h1.main-title {
          text-align: center;
          text-decoration: underline;
          font-size: 14px;
          font-weight: bold;
          margin: 12px 0;
          text-transform: uppercase;
        }

        .section-box {
          border: 1px solid black;
          margin-bottom: -1px;
          padding: 5px;
        }
        
        .section-header {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
          display: inline-block;
        }

        ol, ul { margin: 5px 0 5px 20px; padding: 0; }
        li { margin-bottom: 2px; }

        .date-badge {
          background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
          border: 1px solid black;
          padding: 5px 16px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          width: fit-content;
          margin: 8px auto;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
          border-radius: 4px;
        }

       .gallery-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 10px 0;
        }

        .photo-frame {
            background-color: white;
            padding: 0;
            border: 4px solid #FFD700;
            box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
            width: 100%;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .footer-container {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 15px;
        }

        .signature-table {
          width: 100%;
          border: 1px solid black;
        }
        
        .signature-header {
          background-color: #FFFF00;
          font-weight: bold;
          text-align: center;
          padding: 5px;
          border-bottom: 1px solid black;
        }

        .signature-box {
          height: 80px;
          text-align: center;
          vertical-align: bottom;
        }
        
        .footer-image-frame {
           border: 4px solid #FFD700;
           box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
           width: 160px;
           height: 200px;
           overflow: hidden;
        }
        
        .footer-image-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
      </style>
    </head>

    <body>

      <table class="header-table">
        <tr>
          <td class="logo-cell" rowspan="2">
             <img src="https://www.pt-aau.com/wp-content/uploads/2025/05/logo-circle.png"
                  width="80" height="80" alt="Logo PT AAU" />
          </td>
          
          <td class="title-cell">
            <div style="font-size: 14px; font-weight: bold;">PT.ADITYA ANDHIKA UTAMA</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">LAPORAN KEGIATAN</div>
          </td>

          <td style="width: 250px; padding:0;">
            <table class="meta-table">
              <tr>
                <td width="100">No. Dokumen</td>
                <td>: ${data.record_number}</td>
              </tr>
              <tr>
                <td>Tanggal Kegiatan</td>
                <td>: ${shortDate}</td>
              </tr>
              <tr>
                <td>Revisi</td>
                <td>: </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 5px; font-weight: bold; vertical-align: middle; border-right: 1px solid black;">
            &nbsp; Departemen &nbsp; : HSE
          </td>
          <td style="padding:0;">
             <table class="meta-table">
              <tr>
                <td width="100">Tanggal Revisi</td>
                <td>: -</td>
              </tr>
              <tr>
                <td>Halaman</td>
                <td>: 1</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <h1 class="main-title">LAPORAN KEGIATAN SERVICE CHASSIS</h1>

      <div style="border: 1px solid black;">

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">A. Tujuan Kegiatan :</span>
          <div style="font-size: 10px; margin-bottom: 5px;">
            Untuk menjaga performa, keamanan, dan keandalan chassis agar tetap optimal. Berikut adalah beberapa tujuan spesifik dari kegiatan service chassis:
          </div>
          
          <ol style="column-count: 2; column-gap: 20px; margin: 0 0 5px 20px; font-size: 10px;">
            <li><span class="bold">Memastikan Keamanan Berkendara</span></li>
            <li><span class="bold">Memperpanjang Umur Pakai Chassis</span></li>
            <li><span class="bold">Mengoptimalkan Performa Chassis</span></li>
            <li><span class="bold">Mencegah Kerusakan yang Lebih Parah</span></li>
            <li><span class="bold">Memenuhi Standar Emisi</span></li>
            <li><span class="bold">Menjaga Nilai Jual Chassis</span></li>
            <li><span class="bold">Menghemat Biaya Operasional</span></li>
            <li><span class="bold">Memastikan Kenyamanan Berkendara</span></li>
            <li><span class="bold">Memenuhi Kewajiban Garansi</span></li>
            <li><span class="bold">Mencegah Gangguan di Jalan</span></li>
          </ol>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">B. Penanggung Jawab Kegiatan :</span>
          <ul style="font-size: 10px; margin: 0 0 5px 20px; padding: 0;">
            <li>Petugas Safety</li>
            <li>TEAM Mekanik</li>
            <li>Direktur & Koordinator Safety</li>
          </ul>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">C. Peralatan Pelindung Diri (PPE) :</span>
          <div style="font-size: 10px;">APD</div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
           <div style="display: flex; gap: 24px; align-items: flex-start;">
              <div style="flex: 1;">
                <span class="section-header">D. Data Chassis :</span>
                <table class="table-clean">
                    <tr>
                        <td class="label">Nama Chassis</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.name}</td>
                    </tr>
                    <tr>
                        <td class="label">Nomor Chassis</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.chassis?.chassis_number}</td>
                    </tr>
                    <tr>
                        <td class="label">Jenis Chassis</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.chassis?.chassis_type}</td>
                    </tr>
                    <tr>
                        <td class="label">Kilometer</td>
                        <td class="separator">:</td>
                        <td class="value">${data.km_asset} KM</td>
                    </tr>
                </table>
              </div>
              <div style="flex: 1;">
              <table class="table-clean" style="margin-top: 18px;">
                  <tr>
                      <td class="label">Jumlah Axle</td>
                      <td class="separator">:</td>
                      <td class="value">${data.asset?.chassis?.axle_count}</td>
                  </tr>
                  <tr>
                      <td class="label">Nomor KIR</td>
                      <td class="separator">:</td>
                      <td class="value">${data.asset?.chassis?.no_kir}</td>
                  </tr>
                  <tr>
                      <td class="label">Tanggal Akhir KIR</td>
                      <td class="separator">:</td>
                      <td class="value">${kirShortDate}</td>
                  </tr>
                  <tr>
                      <td class="label">Catatan</td>
                      <td class="separator">:</td>
                      <td class="value">${data.asset?.chassis?.notes || "-"}</td>
                  </tr>
              </table>
              </div>
           </div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <div style="display: flex; gap: 24px; align-items: flex-start;">
            <div style="flex: 1;">
              <span class="section-header">E. Data Driver :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Nomor Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.driver_number}</td>
                </tr>
                <tr>
                  <td class="label">Nama Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.name}</td>
                </tr>
                <tr>
                  <td class="label">Nomor HP</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.phone}</td>
                </tr>
                 <tr>
                  <td class="label">Tanggal Kadaluarsa SIM</td>
                  <td class="separator">:</td>
                  <td class="value">
                    ${formatDateID(data.driver?.sim_due_date) ?? "-"}
                  </td>
                </tr>
              </table>
            </div>

            <div style="flex: 1;">
              <span class="section-header">F. Kegiatan :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Keluhan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.complaint}</td>
                </tr>
                <tr>
                  <td class="label">Catatan Perbaikan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.repair_notes}</td>
                </tr>
                <tr>
                  <td class="label">Sparepart</td>
                  <td class="separator">:</td>
                  <td class="value">${sparepartsHTML}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black; min-height: 200px;">
          <span class="section-header">G. Dokumentasi Kegiatan:</span>
          <div class="date-badge">${dateString}</div>
          <div class="gallery-container">
            ${galleryImages.map((img: any) => `
              <div class="photo-frame">
                <img src="${img.url}" />
              </div>
            `).join("")}
            ${galleryImages.length === 0 ? '<div style="padding:20px; text-align:center;">Tidak ada dokumentasi foto</div>' : ""}
          </div>
        </div>

        <div class="section-box" style="border: none;">
          <span class="section-header">H. Lokasi Kegiatan :</span>
          <div style="font-size: 10px;">${data.location ?? "Warehouse"}</div>
        </div>

      </div>

      <div class="footer-container">
        <div style="flex: 1;">
          <table class="signature-table">
            <thead>
              <tr>
                <th class="signature-header" style="width: 33%;">Dilakukan oleh :</th>
                <th class="signature-header" style="width: 33%;">Dilaporkan oleh :</th>
                <th class="signature-header" style="width: 33%;">Disetujui oleh :</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="signature-box">
                  <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${data.done_by}</span><br>
                  (Mekanik)
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${data.user?.fullname}</span><br>
                  (${data.user?.role})
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">Aditya Putra</span><br>
                  (Direktur & Koordinator safety)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        ${footerImage ? `
        <div class="footer-image-frame">
          <img src="${footerImage}" />
        </div>
        ` : ""}
      </div>
    </body>
  </html>
  `;
}

export function generateEquipmentHTML(data: any) {
  // Format Tanggal Indonesia (misal: RABU, 29 OKTOBER 2025)
  const dateObj = new Date(data.createdAt);
  const dateString = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const shortDate = dateObj
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/ /g, "-"); // Format: 29-OKTOBER-25

  const sparepartsHTML = data.spareparts.length
    ? data.spareparts
        .map((item: any) => {
          return `
          <div>
            ${item.sparepart.code} - ${item.sparepart.name}
            (${item.total} ${item.sparepart.unit})
          </div>
        `;
        })
        .join("")
    : "<div>Tidak ada sparepart</div>";

  const galleryImages = data.images.slice(0, 3);
  const footerImage = data.asset_image_url;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 0; }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
          padding: 20px;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
        }

        .table-clean {
          width: 100%;
          border-collapse: collapse;
        }

        .table-clean td {
          border: none !important;
          padding: 2px 0;
          font-size: 10px;
        }

        .table-clean td.label {
          width: 140px;
          text-align: left;
          padding-right: 5px;
          white-space: nowrap;
        }

        .table-clean td.separator {
          width: 10px;
          text-align: center;
        }

        .table-clean td.value {
          width: auto;
          text-align: left;
        }

        .bold { font-weight: bold; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        td, th {
          border: 1px solid black;
          padding: 4px 2px;
          vertical-align: top;
          font-size: 10px;
        }

        .header-table td { padding: 0; border: 1px solid black; }
        .logo-cell { width: 100px; text-align: center; vertical-align: middle; padding: 5px; }
        .title-cell { text-align: center; vertical-align: middle; }
        .meta-table { width: 100%; border: none; margin: 0; }
        .meta-table td { border: none; border-bottom: 1px solid black; border-left: 1px solid black; padding: 2px 2px; font-size: 10px; }
        .meta-table tr:last-child td { border-bottom: none; }

        h1.main-title {
          text-align: center;
          text-decoration: underline;
          font-size: 14px;
          font-weight: bold;
          margin: 12px 0;
          text-transform: uppercase;
        }

        .section-box {
          border: 1px solid black;
          margin-bottom: -1px;
          padding: 5px;
        }
        
        .section-header {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
          display: inline-block;
        }

        ol, ul { margin: 5px 0 5px 20px; padding: 0; }
        li { margin-bottom: 2px; }

        .date-badge {
          background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
          border: 1px solid black;
          padding: 5px 16px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          width: fit-content;
          margin: 8px auto;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
          border-radius: 4px;
        }

       .gallery-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 10px 0;
        }

        .photo-frame {
            background-color: white;
            padding: 0;
            border: 4px solid #FFD700;
            box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
            width: 100%;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .footer-container {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 15px;
        }

        .signature-table {
          width: 100%;
          border: 1px solid black;
        }
        
        .signature-header {
          background-color: #FFFF00;
          font-weight: bold;
          text-align: center;
          padding: 5px;
          border-bottom: 1px solid black;
        }

        .signature-box {
          height: 80px;
          text-align: center;
          vertical-align: bottom;
        }
        
        .footer-image-frame {
           border: 4px solid #FFD700;
           box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
           width: 160px;
           height: 200px;
           overflow: hidden;
        }
        
        .footer-image-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
      </style>
    </head>

    <body>

      <table class="header-table">
        <tr>
          <td class="logo-cell" rowspan="2">
             <img src="https://www.pt-aau.com/wp-content/uploads/2025/05/logo-circle.png"
                  width="80" height="80" alt="Logo PT AAU" />
          </td>
          
          <td class="title-cell">
            <div style="font-size: 14px; font-weight: bold;">PT.ADITYA ANDHIKA UTAMA</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">LAPORAN KEGIATAN</div>
          </td>

          <td style="width: 250px; padding:0;">
            <table class="meta-table">
              <tr>
                <td width="100">No. Dokumen</td>
                <td>: ${data.record_number || "-"}</td>
              </tr>
              <tr>
                <td>Tanggal Kegiatan</td>
                <td>: ${shortDate}</td>
              </tr>
              <tr>
                <td>Revisi</td>
                <td>: </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 5px; font-weight: bold; vertical-align: middle; border-right: 1px solid black;">
            &nbsp; Departemen &nbsp; : HSE
          </td>
          <td style="padding:0;">
             <table class="meta-table">
              <tr>
                <td width="100">Tanggal Revisi</td>
                <td>: -</td>
              </tr>
              <tr>
                <td>Halaman</td>
                <td>: 1</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <h1 class="main-title">LAPORAN KEGIATAN SERVICE EQUIPMENT</h1>

      <div style="border: 1px solid black;">

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">A. Tujuan Kegiatan :</span>
          <div style="font-size: 10px; margin-bottom: 5px;">
            Untuk menjaga performa dan keamanan equipment agar tetap optimal. Berikut adalah beberapa tujuan spesifik dari kegiatan service equipment:
          </div>
          
          <ol style="column-count: 2; column-gap: 20px; margin: 0 0 5px 20px; font-size: 10px;">
            <li><span class="bold">Memperpanjang Umur Pakai Equipment</span></li>
            <li><span class="bold">Mengoptimalkan Performa Equipment</span></li>
            <li><span class="bold">Mencegah Kerusakan yang Lebih Parah</span></li>
            <li><span class="bold">Menjaga Nilai Jual Equipment</span></li>
            <li><span class="bold">Menghemat Biaya Operasional</span></li>
            <li><span class="bold">Memenuhi Kewajiban Garansi</span></li>
          </ol>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">B. Penanggung Jawab Kegiatan :</span>
          <ul style="font-size: 10px; margin: 0 0 5px 20px; padding: 0;">
            <li>Petugas Safety</li>
            <li>TEAM Mekanik</li>
            <li>Direktur & Koordinator Safety</li>
          </ul>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <span class="section-header">C. Peralatan Pelindung Diri (PPE) :</span>
          <div style="font-size: 10px;">APD</div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
           <div style="display: flex; gap: 24px; align-items: flex-start;">
              <div style="flex: 1;">
                <span class="section-header">D. Data Equipment :</span>
                <table class="table-clean">
                    <tr>
                        <td class="label">Nama Equipment</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.name}</td>
                    </tr>
                    <tr>
                        <td class="label">Kode Equipment</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.equipment?.equipment_code}</td>
                    </tr>
                    <tr>
                        <td class="label">Jenis Equipment</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.equipment?.equipment_type}</td>
                    </tr>
                </table>
              </div>
              <div style="flex: 1;">
                <table class="table-clean" style="margin-top: 18px;">
                    <tr>
                        <td class="label">Spesifikasi</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.equipment?.specification || "-"}</td>
                    </tr>
                    <tr>
                        <td class="label">Kondisi</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.equipment?.condition || "-"}</td>
                    </tr>
                    <tr>
                        <td class="label">Catatan Asset</td>
                        <td class="separator">:</td>
                        <td class="value">${data.asset?.notes || "-"}</td>
                    </tr>
                </table>
              </div>
           </div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black;">
          <div style="display: flex; gap: 24px; align-items: flex-start;">
            <div style="flex: 1;">
              <span class="section-header">E. Data Driver :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Nomor Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.driver_number || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Nama Driver</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.name || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Nomor HP</td>
                  <td class="separator">:</td>
                  <td class="value">${data.driver?.phone || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Tanggal Kadaluarsa SIM</td>
                  <td class="separator">:</td>
                  <td class="value">
                    ${formatDateID(data.driver?.sim_due_date) ?? "-"}
                  </td>
                </tr>
              </table>
            </div>

            <div style="flex: 1;">
              <span class="section-header">F. Kegiatan :</span>
              <table class="table-clean">
                <tr>
                  <td class="label">Keluhan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.complaint || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Catatan Perbaikan</td>
                  <td class="separator">:</td>
                  <td class="value">${data.repair_notes || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Sparepart</td>
                  <td class="separator">:</td>
                  <td class="value">${sparepartsHTML}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div class="section-box" style="border: none; border-bottom: 1px solid black; min-height: 200px;">
          <span class="section-header">G. Dokumentasi Kegiatan:</span>
          <div class="date-badge">${dateString}</div>
          <div class="gallery-container">
            ${galleryImages.map((img: any) => `
              <div class="photo-frame">
                <img src="${img.url}" />
              </div>
            `).join("")}
            ${galleryImages.length === 0 ? '<div style="padding:20px; text-align:center;">Tidak ada dokumentasi foto</div>' : ""}
          </div>
        </div>

        <div class="section-box" style="border: none;">
          <span class="section-header">H. Lokasi Kegiatan :</span>
          <div style="font-size: 10px;">${data.location ?? "Warehouse"}</div>
        </div>
      </div>

      <div class="footer-container">
        <div style="flex: 1;">
          <table class="signature-table">
            <thead>
              <tr>
                <th class="signature-header" style="width: 33%;">Dilakukan oleh :</th>
                <th class="signature-header" style="width: 33%;">Dilaporkan oleh :</th>
                <th class="signature-header" style="width: 33%;">Disetujui oleh :</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="signature-box">
                  <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${data.done_by}</span><br>
                  (Mekanik)
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">${data.user?.fullname}</span><br>
                  (${data.user?.role})
                </td>
                <td class="signature-box">
                   <br><br><br>
                  <span class="bold" style="text-decoration: underline;">Aditya Putra</span><br>
                  (Direktur & Koordinator safety)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        ${footerImage ? `
        <div class="footer-image-frame">
          <img src="${footerImage}" />
        </div>
        ` : ""}
      </div>

    </body>
  </html>
  `;
}