import frappe
from frappe.tests.utils import FrappeTestCase


class TestDailyStat(FrappeTestCase):
    def setUp(self):
        frappe.db.savepoint("test_daily_stat")

    def tearDown(self):
        frappe.db.rollback(save_point="test_daily_stat")

    def _make_stat(self, date="2026-07-01", cards_viewed=5):
        return frappe.get_doc(
            {"doctype": "Daily Stat", "date": date, "cards_viewed": cards_viewed}
        )

    def test_rejects_duplicate_date_for_same_user(self):
        self._make_stat().insert(ignore_permissions=True)
        with self.assertRaises(frappe.ValidationError):
            self._make_stat().insert(ignore_permissions=True)

    def test_allows_same_date_for_different_users(self):
        self._make_stat().insert(ignore_permissions=True)
        other = self._make_stat()
        other.user = "Guest"
        other.insert(ignore_permissions=True)
        self.assertTrue(frappe.db.exists("Daily Stat", other.name))
