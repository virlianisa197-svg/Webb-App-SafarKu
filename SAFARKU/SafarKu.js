/* Safarku - main.js
   Dipakai oleh: daftar.html, admin-dashboard.html (aman dimuat di semua halaman) */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Penyimpanan aman (tetap jalan jika storage diblokir) ---------- */
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* abaikan */ }
  }

  /* ---------- Mode Sederhana (tulisan besar) ---------- */
  function setSimple(on) {
    root.classList.toggle('simple', on);
    save('safarku-simple', on ? '1' : '0');
  }
  // terapkan pilihan tersimpan di semua halaman
  if (load('safarku-simple') === '1') root.classList.add('simple');

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.hd nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Buka menu');
        menuBtn.focus();
      }
    });
  }

  /* ---------- Halaman daftar ---------- */
  var form = document.getElementById('form-daftar');
  if (form) {
    var status = document.getElementById('daftar-status');
    var toggle = form.querySelector('input[type="checkbox"]');

    // sinkronkan kotak centang dengan pilihan tersimpan
    if (toggle) {
      var saved = load('safarku-simple');
      if (saved !== null) toggle.checked = saved === '1';
      setSimple(toggle.checked);
      toggle.addEventListener('change', function () { setSimple(toggle.checked); });
    }

    function show(text, isError) {
      status.textContent = text;
      status.classList.toggle('err', !!isError);
      status.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nama = form.querySelector('#nama');
      var hp = form.querySelector('#hp');
      var darurat = form.querySelector('#darurat');
      var fields = [nama, hp, darurat];

      fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });

      var kosong = fields.filter(function (f) { return !f.value.trim(); });
      if (kosong.length) {
        kosong.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
        show('Lengkapi semua kolom yang kosong.', true);
        kosong[0].focus();
        return;
      }

      var digits = hp.value.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 15) {
        hp.setAttribute('aria-invalid', 'true');
        show('Nomor HP tidak valid. Tulis 9 sampai 15 angka, contoh 081234567890.', true);
        hp.focus();
        return;
      }

      // simpan sementara di perangkat; ganti dengan fetch() ke server bila sudah ada backend
      var data = {
        nama: nama.value.trim(),
        hp: hp.value.trim(),
        darurat: darurat.value.trim(),
        modeSederhana: toggle ? toggle.checked : false,
        status: 'menunggu',
        waktu: new Date().toISOString()
      };
      save('safarku-pendaftaran', JSON.stringify(data));

      show('Pendaftaran terkirim. Pengelola travel akan memverifikasi data Anda.', false);
      form.reset();
      if (toggle) toggle.checked = data.modeSederhana;
    });
  }

  /* ---------- Dashboard admin: unduh laporan CSV ---------- */
  var unduh = document.querySelector('.main a.btn[href="#"]');
  var tabel = document.querySelector('.tbl table');
  if (unduh && tabel) {
    unduh.addEventListener('click', function (e) {
      e.preventDefault();

      var baris = Array.prototype.map.call(tabel.rows, function (tr) {
        return Array.prototype.map.call(tr.cells, function (td) {
          return '"' + td.textContent.trim().replace(/"/g, '""') + '"';
        }).join(',');
      });

      var blob = new Blob(['\ufeff' + baris.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-safarku-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
})();
