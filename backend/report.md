============================= test session starts ==============================
platform linux -- Python 3.14.4, pytest-9.0.3, pluggy-1.6.0
rootdir: /home/runsha/Project/Planno
plugins: anyio-4.12.1, md-report-0.8.0
collected 56 items

../tests/test_planno_cases.py ........FF.....................F..F....... [ 75%]
..............                                                           [100%]

=================================== FAILURES ===================================
______________ TestAddTask.test_task_add_01a_nlp_ekstrak_deadline ______________

self = <tests.test_planno_cases.TestAddTask object at 0x7fbe2fede210>

    def test_task_add_01a_nlp_ekstrak_deadline(self):
        """Deskripsi task dengan deadline eksplisit → deadline terisi"""
        besok = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        hasil = parser.parse("kerjakan laporan keuangan besok jam 5 sore durasi 2 jam")
        assert hasil["success"] is True
        assert hasil["title"] is not None and len(hasil["title"]) > 0
>       assert hasil.get("deadline") is not None
E       AssertionError: assert None is not None
E        +  where None = <built-in method get of dict object at 0x7fbe2fe07900>('deadline')
E        +    where <built-in method get of dict object at 0x7fbe2fe07900> = {'category': 'work', 'deadline': None, 'duration_minutes': None, 'error': None, ...}.get

../tests/test_planno_cases.py:188: AssertionError
_______________ TestAddTask.test_task_add_01b_nlp_ekstrak_durasi _______________

self = <tests.test_planno_cases.TestAddTask object at 0x7fbe2fede350>

    def test_task_add_01b_nlp_ekstrak_durasi(self):
        """input dengan '2 jam' → duration_minutes = 120"""
        hasil = parser.parse("kerjakan laporan keuangan besok jam 5 sore durasi 2 jam")
        print(f"Parsed duration_minutes: {hasil.get('duration_minutes')} (type: {type(hasil.get('duration_minutes'))})")
        assert hasil["success"] is True
>       assert int(hasil.get("duration_minutes")) == 120
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'

../tests/test_planno_cases.py:196: TypeError
----------------------------- Captured stdout call -----------------------------
Parsed duration_minutes: None (type: <class 'NoneType'>)
______________ TestNLPParser.test_nlp_01b_parse_duration_minutes _______________

self = <tests.test_planno_cases.TestNLPParser object at 0x7fbe2fedec10>

    def test_nlp_01b_parse_duration_minutes(self):
        """(b) Input '2 jam' → duration_minutes = 120 (int or '120' string)"""
        hasil = parser.parse("Kerjakan soal 2 jam")
        print(f"Parsed duration_minutes: {hasil.get('duration_minutes')} (type: {type(hasil.get('duration_minutes'))})")
        assert hasil["success"] is True
        # Parser may return int or str depending on LLM output; both are valid
>       assert int(hasil.get("duration_minutes")) == 120
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'

../tests/test_planno_cases.py:476: TypeError
----------------------------- Captured stdout call -----------------------------
Parsed duration_minutes: None (type: <class 'NoneType'>)
___________ TestNLPParser.test_nlp_01e_response_time_under_2_seconds ___________

self = <tests.test_planno_cases.TestNLPParser object at 0x7fbe2fe99250>

    def test_nlp_01e_response_time_under_2_seconds(self):
        """
        Performance: response time harus di bawah batas wajar.
        Target ideal: < 2 detik. Karena Groq API call over network,
        batas toleransi diperlonggar ke 10 detik untuk environment test.
        Temuan: rata-rata ~4.4s (Groq llama-3.1-8b-instant, cold call).
        """
        start = time.time()
        client.post("/api/tasks/parse", json={"raw_input": "Beli susu besok"})
        elapsed = time.time() - start
        # Network-tolerant limit; Groq API latency is variable (4-15s)
        print(f"\n  [PERF] NLP parse response time: {elapsed:.2f}s (target < 2s idealnya)")
>       assert elapsed < 30.0, f"Response time {elapsed:.2f}s exceeded 30s hard limit"
E       AssertionError: Response time 30.63s exceeded 30s hard limit
E       assert 30.629337787628174 < 30.0

../tests/test_planno_cases.py:507: AssertionError
----------------------------- Captured stdout call -----------------------------

  [PERF] NLP parse response time: 30.63s (target < 2s idealnya)
=========================== short test summary info ============================
FAILED ../tests/test_planno_cases.py::TestAddTask::test_task_add_01a_nlp_ekstrak_deadline
FAILED ../tests/test_planno_cases.py::TestAddTask::test_task_add_01b_nlp_ekstrak_durasi
FAILED ../tests/test_planno_cases.py::TestNLPParser::test_nlp_01b_parse_duration_minutes
FAILED ../tests/test_planno_cases.py::TestNLPParser::test_nlp_01e_response_time_under_2_seconds
=================== 4 failed, 52 passed in 278.94s (0:04:38) ===================
|          filepath          |                                function                                 | [92mpassed[0m | [91mfailed[0m | SUBTOTAL |
| -------------------------- | ----------------------------------------------------------------------- | -----: | -----: | -------: |
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestAuth.test_auth_01a_unauthenticated_should_redirect_to_login         [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestAuth.test_auth_01b_new_user_redirect_to_onboarding                  [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestAuth.test_auth_01c_returning_user_redirect_to_planner               [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestAuth.test_auth_01d_incomplete_preferences_treated_as_new_user       [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestOnboarding.test_obd_01a_valid_preferences_accepted_by_backend       [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestOnboarding.test_obd_01b_incomplete_prefs_finish_disabled            [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestOnboarding.test_obd_01c_all_required_empty_finish_disabled          [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestOnboarding.test_obd_01d_complete_prefs_finish_enabled               [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestAddTask.test_task_add_01c_nlp_ekstrak_kategori                      [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestAddTask.test_task_add_02a_api_parse_task_valid                      [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestAddTask.test_task_add_02b_api_score_task_valid                      [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestAddTask.test_task_add_03a_empty_input_rejected                      [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestAddTask.test_task_add_03b_parser_returns_error_for_empty_string     [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestAddTask.test_task_add_03c_script_injection_stored_as_plain_text     [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPlanner.test_plan_01a_health_endpoint                               [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestPlanner.test_plan_01b_api_tasks_requires_auth                       [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPlanner.test_plan_01c_data_isolation_logic                          [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestPlanner.test_plan_02a_unauthenticated_redirect_logic                [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPlanner.test_plan_02b_api_parse_missing_body_returns_422            [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestUpdateTask.test_upd_01a_patch_completed_logic                       [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestUpdateTask.test_upd_01b_patch_title_logic                           [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestUpdateTask.test_upd_02a_ownership_check_logic                       [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestUpdateTask.test_upd_02b_no_session_returns_401_logic                [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestUpdateTask.test_upd_02c_empty_body_doesnt_mutate_data               [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestDeleteTask.test_del_01a_delete_own_task_logic                       [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestDeleteTask.test_del_01b_delete_other_users_task_returns_404         [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestDeleteTask.test_del_01c_delete_without_session_returns_401          [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestDeleteTask.test_del_01d_invalid_id_returns_404_logic                [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestNLPParser.test_nlp_01a_parse_deadline_eksplisit                     [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestNLPParser.test_nlp_01c_parse_kategori_relevan                       [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestNLPParser.test_nlp_01d_parse_via_api_endpoint                       [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestNLPParser.test_nlp_02a_empty_input_returns_error                    [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestNLPParser.test_nlp_02b_empty_input_direct_parser                    [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestNLPParser.test_nlp_02c_whitespace_only_input                        [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestNLPParser.test_nlp_02d_symbols_only_no_server_crash                 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestNLPParser.test_nlp_02e_code_switching_input                         [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPriorityScore.test_score_01a_urgent_important_gets_high_score       [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestPriorityScore.test_score_01b_non_urgent_unimportant_gets_low_score  [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPriorityScore.test_score_01c_quadrant_do_first_for_urgent           [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestPriorityScore.test_score_01d_quadrant_always_valid_value            [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPriorityScore.test_score_01e_api_endpoint_returns_correct_structure [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestPriorityScore.test_score_01f_missing_importance_returns_422         [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestPriorityScore.test_score_01g_score_response_time_under_1_second     [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestDailyBriefing.test_brief_01a_briefing_generated_successfully        [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestDailyBriefing.test_brief_01b_briefing_via_api_endpoint              [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestDailyBriefing.test_brief_01c_top_tasks_ordered_by_priority          [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestDailyBriefing.test_brief_01d_briefing_mentions_user_name            [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestDailyBriefing.test_brief_01e_empty_tasks_returns_gracefully         [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestFocusSession.test_focus_01a_timer_starts_when_task_selected         [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestFocusSession.test_focus_01b_cannot_start_without_task               [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[92m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m TestFocusSession.test_focus_01c_stop_saves_elapsed_seconds              [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[92m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[92m tests/test_planno_cases.py [0m[40m|[0m[40m[92m TestFocusSession.test_focus_01d_actual_seconds_patch_api                [0m[40m|[0m[40m[92m      1 [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[92m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[91m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m TestAddTask.test_task_add_01a_nlp_ekstrak_deadline                      [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[91m tests/test_planno_cases.py [0m[40m|[0m[40m[91m TestAddTask.test_task_add_01b_nlp_ekstrak_durasi                        [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[91m      1 [0m[40m|[0m[40m[91m        1 [0m[40m|[0m
[48;2;32;32;32m|[0m[48;2;32;32;32m[91m tests/test_planno_cases.py [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m TestNLPParser.test_nlp_01b_parse_duration_minutes                       [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[90m      0 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m      1 [0m[48;2;32;32;32m|[0m[48;2;32;32;32m[91m        1 [0m[48;2;32;32;32m|[0m
[40m|[0m[40m[91m tests/test_planno_cases.py [0m[40m|[0m[40m[91m TestNLPParser.test_nlp_01e_response_time_under_2_seconds                [0m[40m|[0m[40m[90m      0 [0m[40m|[0m[40m[91m      1 [0m[40m|[0m[40m[91m        1 [0m[40m|[0m
[48;2;0;0;0m|[0m[48;2;0;0;0m[91m TOTAL                      [0m[48;2;0;0;0m|[0m[48;2;0;0;0m[91m                                                                         [0m[48;2;0;0;0m|[0m[48;2;0;0;0m[92m     52 [0m[48;2;0;0;0m|[0m[48;2;0;0;0m[91m      4 [0m[48;2;0;0;0m|[0m[48;2;0;0;0m[91m       56 [0m[48;2;0;0;0m|[0m
