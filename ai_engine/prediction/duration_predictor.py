# File: ai_engine/prediction/duration_predictor.py
# Modul: Realistic Duration Prediction
# Deskripsi: Memprediksi durasi realistis berdasarkan histori user
# Menggunakan: scikit-learn Regression
# Input: kategori task, estimasi user, histori task serupa
# Output: prediksi durasi yang dikoreksi dalam menit
# Status: TODO - akan diimplementasi minggu 3-4

import os
import json
from datetime import datetime


class DurationPredictor:
    """
    Modul untuk memprediksi durasi realistis sebuah task berdasarkan
    histori perbandingan estimasi vs durasi aktual user.
    Fase 1: rule-based dengan correction factor per kategori.
    Fase 2: akan diupgrade ke ML model setelah data cukup.

    Cara pakai:
        predictor = DurationPredictor()
        predictor.record_actual("user_001", "academic", 60, 85)
        prediksi = predictor.predict("user_001", "academic", 60)
        print(prediksi)
    """

    DEFAULT_CORRECTION_FACTOR = {
        "academic": 1.4,
        "work": 1.2,
        "personal": 1.1,
        "health": 1.0
    }

    MIN_DATA_UNTUK_BELAJAR = 5

    def __init__(self):
        self._history = {}

    def record_actual(
        self,
        user_id: str,
        category: str,
        estimasi_menit: int,
        aktual_menit: int
    ) -> dict:
        """
        Catat durasi aktual setelah task selesai.

        Args:
            user_id (str): ID user
            category (str): kategori task
            estimasi_menit (int): estimasi awal user
            aktual_menit (int): durasi aktual yang dibutuhkan

        Returns:
            dict: {success, message}
        """

        if estimasi_menit <= 0 or aktual_menit <= 0:
            return {
                "success": False,
                "message": "Durasi harus lebih dari 0 menit"
            }

        if user_id not in self._history:
            self._history[user_id] = []

        rasio = aktual_menit / estimasi_menit

        self._history[user_id].append({
            "tanggal": datetime.now().strftime("%Y-%m-%d"),
            "category": category,
            "estimasi": estimasi_menit,
            "aktual": aktual_menit,
            "rasio": rasio
        })

        return {
            "success": True,
            "message": f"Data durasi berhasil dicatat. Rasio: {rasio:.2f}x estimasi"
        }

    def predict(
        self,
        user_id: str,
        category: str,
        estimasi_menit: int
    ) -> dict:
        """
        Prediksi durasi realistis berdasarkan histori user.

        Args:
            user_id (str): ID user
            category (str): kategori task
            estimasi_menit (int): estimasi awal user

        Returns:
            dict: {
                estimasi_user (int),
                prediksi_aktual (int),
                correction_factor (float),
                confidence (str): low/medium/high,
                pesan (str)
            }
        """

        correction_factor = self._get_correction_factor(user_id, category)
        prediksi = round(estimasi_menit * correction_factor)
        data_count = self._get_data_count(user_id, category)

        if data_count >= 20:
            confidence = "high"
        elif data_count >= self.MIN_DATA_UNTUK_BELAJAR:
            confidence = "medium"
        else:
            confidence = "low"

        selisih = prediksi - estimasi_menit

        if selisih > 0:
            pesan = f"Berdasarkan histori kamu, task ini biasanya memakan waktu {prediksi} menit, bukan {estimasi_menit} menit"
        else:
            pesan = f"Estimasimu sudah cukup akurat. Prediksi: {prediksi} menit"

        return {
            "estimasi_user": estimasi_menit,
            "prediksi_aktual": prediksi,
            "correction_factor": round(correction_factor, 2),
            "confidence": confidence,
            "pesan": pesan,
            "data_points": data_count
        }

    def get_accuracy_report(self, user_id: str) -> dict:
        """
        Laporan akurasi estimasi user secara keseluruhan.

        Args:
            user_id (str): ID user

        Returns:
            dict: {
                total_tasks (int),
                rata_rata_rasio (float),
                kategori_paling_meleset (str | None),
                akurasi_persen (float)
            }
        """

        history = self._history.get(user_id, [])

        if not history:
            return {
                "total_tasks": 0,
                "rata_rata_rasio": None,
                "kategori_paling_meleset": None,
                "akurasi_persen": None
            }

        semua_rasio = [h["rasio"] for h in history]
        rata_rata_rasio = sum(semua_rasio) / len(semua_rasio)

        per_kategori = {}
        for h in history:
            cat = h["category"]
            if cat not in per_kategori:
                per_kategori[cat] = []
            per_kategori[cat].append(h["rasio"])

        rata_per_kategori = {
            cat: sum(rasios) / len(rasios)
            for cat, rasios in per_kategori.items()
        }

        kategori_paling_meleset = max(
            rata_per_kategori,
            key=rata_per_kategori.get
        ) if rata_per_kategori else None

        akurasi = max(0, 100 - abs(rata_rata_rasio - 1) * 100)

        return {
            "total_tasks": len(history),
            "rata_rata_rasio": round(rata_rata_rasio, 2),
            "kategori_paling_meleset": kategori_paling_meleset,
            "akurasi_persen": round(akurasi, 1)
        }

    def _get_correction_factor(self, user_id: str, category: str) -> float:
        """Hitung correction factor dari histori user atau pakai default."""
        history = self._history.get(user_id, [])
        relevant = [
            h for h in history
            if h["category"] == category
        ]

        if len(relevant) >= self.MIN_DATA_UNTUK_BELAJAR:
            rasio_list = [h["rasio"] for h in relevant]
            return sum(rasio_list) / len(rasio_list)

        return self.DEFAULT_CORRECTION_FACTOR.get(category, 1.2)

    def _get_data_count(self, user_id: str, category: str) -> int:
        """Hitung jumlah data histori untuk kategori tertentu."""
        history = self._history.get(user_id, [])
        return len([h for h in history if h["category"] == category])