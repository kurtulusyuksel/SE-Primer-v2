"""Veri kapısı doğrulayıcısının anlamlı kontrolleri."""
import importlib.util
from pathlib import Path
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validate_data', ROOT / 'scripts/validate_data.py')
validate_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validate_data)


def session_id(name):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, name))


def row(name, scene, label=0, seconds=10.0, level=0, wrong=0, hints=0, source='gercek'):
    return {
        'oturum_id': session_id(name), 'kaynak': source, 'seviye': str(level),
        'karar_suresi_sn': str(seconds), 'onceki_yanlis_sayisi': str(wrong),
        'ipucu_sayisi': str(hints), 'sahne_no': str(scene), 'ipucu_gerekli': str(label),
    }


def dataset(sessions, labels=None):
    labels = labels or [0, 1]
    rows = []
    for index in range(sessions):
        label = labels[index % len(labels)]
        for scene in (1, 2, 3):
            rows.append(row(f'oturum-{index}', scene, label=label, seconds=10 + scene + index))
    return rows


class DataValidationTests(unittest.TestCase):
    def test_empty_file_is_rejected_for_training(self):
        result = validate_data.validate([])
        self.assertFalse(result['ok'])
        self.assertIn('Veri satırı yok', result['errors'][0])

    def test_empty_file_is_accepted_in_progress_mode(self):
        result = validate_data.validate([], allow_incomplete=True)
        self.assertTrue(result['ok'])
        self.assertTrue(any('Veri satırı yok' in warning for warning in result['warnings']))

    def test_fourteen_sessions_miss_training_gate(self):
        result = validate_data.validate(dataset(14))
        self.assertFalse(result['ok'])
        self.assertTrue(any('en az 15' in error for error in result['errors']))

    def test_fifteen_complete_sessions_pass(self):
        result = validate_data.validate(dataset(15))
        self.assertTrue(result['ok'], result['errors'])
        self.assertEqual(result['summary']['complete_sessions'], 15)
        self.assertEqual(result['summary']['file_rows'], 45)

    def test_duplicate_session_scene_is_rejected(self):
        rows = dataset(15)
        rows.append(dict(rows[0]))
        result = validate_data.validate(rows)
        self.assertFalse(result['ok'])
        self.assertTrue(any('tekrar ediyor' in error for error in result['errors']))

    def test_out_of_range_feature_is_rejected(self):
        rows = dataset(15)
        rows[0]['karar_suresi_sn'] = '601'
        result = validate_data.validate(rows)
        self.assertFalse(result['ok'])
        self.assertTrue(any('aralık dışında' in error for error in result['errors']))

    def test_incomplete_session_is_rejected_for_training(self):
        rows = dataset(15)
        rows = [item for item in rows if not (item['oturum_id'] == session_id('oturum-0')
                                              and item['sahne_no'] == '3')]
        result = validate_data.validate(rows)
        self.assertFalse(result['ok'])
        self.assertTrue(any('eksik sahne' in error for error in result['errors']))

    def test_single_class_dataset_is_rejected(self):
        result = validate_data.validate(dataset(15, labels=[0]))
        self.assertFalse(result['ok'])
        self.assertTrue(any('Her iki sınıf' in error for error in result['errors']))

    def test_wrong_source_is_rejected(self):
        rows = dataset(15)
        rows[0]['kaynak'] = 'sentetik'
        result = validate_data.validate(rows)
        self.assertFalse(result['ok'])
        self.assertTrue(any("kaynak 'gercek' olmalı" in error for error in result['errors']))

    def test_header_order_warning_does_not_block(self):
        rows = dataset(15)
        header = list(reversed(validate_data.COLUMNS))
        result = validate_data.validate(rows, header)
        self.assertTrue(result['ok'], result['errors'])
        self.assertTrue(any('Sütun sırası' in warning for warning in result['warnings']))


if __name__ == '__main__':
    unittest.main()
