import frappe
from frappe.tests.utils import FrappeTestCase


class TestCard(FrappeTestCase):
    def setUp(self):
        frappe.db.savepoint("test_card")
        self.deck = frappe.get_doc(
            {"doctype": "Deck", "deck_name": "_Test Card Deck"}
        ).insert(ignore_permissions=True)

    def tearDown(self):
        frappe.db.rollback(save_point="test_card")

    def _make_card(self, front="Q", back="A"):
        return frappe.get_doc(
            {"doctype": "Card", "deck": self.deck.name, "front": front, "back": back}
        )

    def test_validate_rejects_blank_front(self):
        with self.assertRaises(frappe.ValidationError):
            self._make_card(front="   ").insert(ignore_permissions=True)

    def test_validate_rejects_blank_back(self):
        with self.assertRaises(frappe.ValidationError):
            self._make_card(back="").insert(ignore_permissions=True)

    def test_validate_strips_whitespace(self):
        doc = self._make_card(front="  Q  ", back="  A  ").insert(ignore_permissions=True)
        self.assertEqual(doc.front, "Q")
        self.assertEqual(doc.back, "A")
