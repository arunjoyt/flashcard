import frappe
from frappe.tests.utils import FrappeTestCase


class TestDeck(FrappeTestCase):
    def setUp(self):
        frappe.db.savepoint("test_deck")

    def tearDown(self):
        frappe.db.rollback(save_point="test_deck")

    def _make_deck(self, deck_name="_Test Deck"):
        return frappe.get_doc({"doctype": "Deck", "deck_name": deck_name}).insert(
            ignore_permissions=True
        )

    def test_deletes_cards_on_trash(self):
        deck = self._make_deck()
        card = frappe.get_doc(
            {"doctype": "Card", "deck": deck.name, "front": "Q", "back": "A"}
        ).insert(ignore_permissions=True)

        deck.delete(ignore_permissions=True)

        self.assertFalse(frappe.db.exists("Card", card.name))

    def test_deleting_empty_deck_does_not_error(self):
        deck = self._make_deck()
        deck.delete(ignore_permissions=True)
        self.assertFalse(frappe.db.exists("Deck", deck.name))
