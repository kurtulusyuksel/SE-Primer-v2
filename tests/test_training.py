"""Eğitim kapısı ve tekrar üretilebilirliğin anlamlı kontrolleri."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('training', ROOT / 'train.py')
training = importlib.util.module_from_spec(spec)
spec.loader.exec_module(training)

class TrainingTests(unittest.TestCase):
    def test_real_data_missing_rejected_without_artifacts(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / 'candidate'
            empty = Path(directory) / 'empty.csv'
            empty.write_text((ROOT / 'data/oturumlar.csv').read_text(encoding='utf-8').splitlines()[0] + '\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Gercek veri yok'):
                training.train(data=empty, output=destination)
            self.assertFalse(destination.exists())

    def test_failed_eval_does_not_overwrite_candidate(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory)
            artifact = destination / 'model.onnx'
            artifact.write_bytes(b'previous-working-version')
            with patch.object(training, 'accuracy_score', return_value=.5):
                with self.assertRaisesRegex(ValueError, 'EVAL KAPISI'):
                    training.train(demo=True, output=destination)
            self.assertEqual(artifact.read_bytes(), b'previous-working-version')
            self.assertFalse((destination / 'config.json').exists())

    def test_same_data_produces_same_model_and_metrics(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            a = training.train(demo=True, output=first)
            b = training.train(demo=True, output=second)
            self.assertEqual(a, b)
            self.assertEqual((Path(first)/'model.onnx').read_bytes(), (Path(second)/'model.onnx').read_bytes())

if __name__ == '__main__':
    unittest.main()
