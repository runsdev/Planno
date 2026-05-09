import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.nlp.onboarding_parser import OnboardingParser

parser = OnboardingParser()

FULL_PREFERENCES = {
    "focusTime": "7-10 pagi",
    "workStyle": "Deep focus",
    "workHours": {"start": "08:00", "end": "17:00"},
    "focusDuration": "60",
    "taskType": "early"
}


def test_parse_return_semua_fields():
    config = parser.parse(FULL_PREFERENCES)
    assert "energy_pattern" in config
    assert "work_start" in config
    assert "work_end" in config
    assert "focus_duration_minutes" in config
    assert "break_interval_minutes" in config
    assert "procrastination_threshold" in config
    assert "briefing_tone" in config


def test_parse_focus_time_7_10_pagi():
    config = parser.parse(FULL_PREFERENCES)
    pattern = config["energy_pattern"]
    # Jam 07-10 harus punya energi tinggi (>=4)
    assert pattern["07"] >= 4
    assert pattern["09"] >= 4
    # Jam malam harus rendah
    assert pattern["20"] <= 3


def test_parse_focus_time_18_22_malam():
    config = parser.parse({**FULL_PREFERENCES, "focusTime": "18-22 malam"})
    pattern = config["energy_pattern"]
    assert pattern["18"] >= 4
    assert pattern["20"] >= 4
    assert pattern["08"] <= 3


def test_parse_focus_duration_30():
    config = parser.parse({**FULL_PREFERENCES, "focusDuration": "30"})
    assert config["focus_duration_minutes"] == 30


def test_parse_focus_duration_120():
    config = parser.parse({**FULL_PREFERENCES, "focusDuration": "120"})
    assert config["focus_duration_minutes"] == 120


def test_parse_work_style_deep_focus():
    config = parser.parse({**FULL_PREFERENCES, "workStyle": "Deep focus"})
    assert config["break_interval_minutes"] == 90
    assert config["briefing_tone"] == "fokus dan tegas"


def test_parse_work_style_multitasking():
    config = parser.parse({**FULL_PREFERENCES, "workStyle": "Multitasking"})
    assert config["break_interval_minutes"] == 45
    assert config["briefing_tone"] == "ringkas dan energik"


def test_parse_task_type_lastminute_vs_early():
    config_lm    = parser.parse({**FULL_PREFERENCES, "taskType": "last-minute"})
    config_early = parser.parse({**FULL_PREFERENCES, "taskType": "early"})
    assert config_lm["procrastination_threshold"] > config_early["procrastination_threshold"]


def test_parse_work_hours():
    config = parser.parse({**FULL_PREFERENCES, "workHours": {"start": "09:00", "end": "18:00"}})
    assert config["work_start"] == "09:00"
    assert config["work_end"] == "18:00"


def test_parse_default_jika_kosong():
    config = parser.parse({})
    assert config["focus_duration_minutes"] == 60
    assert config["work_start"] == "08:00"
    assert config["work_end"] == "17:00"
    assert "energy_pattern" in config


def test_get_peak_hours_from_config():
    config = parser.parse(FULL_PREFERENCES)
    peak = parser.get_peak_hours_from_config(config)
    assert len(peak) == 3
    assert all(":" in h for h in peak)
