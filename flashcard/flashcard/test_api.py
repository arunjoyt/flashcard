import frappe
from frappe.tests.utils import FrappeTestCase

from flashcard.flashcard import api


class TestCreateCards(FrappeTestCase):
    def setUp(self):
        frappe.db.savepoint("test_create_cards")
        self.deck = frappe.get_doc(
            {"doctype": "Deck", "deck_name": "_Test Bulk Add Deck"}
        ).insert(ignore_permissions=True)

    def tearDown(self):
        frappe.db.rollback(save_point="test_create_cards")

    def _card_count(self):
        return frappe.db.count("Card", {"deck": self.deck.name})

    def test_adds_all_cards_in_order(self):
        cards = [{"front": "Q1", "back": "A1"}, {"front": "Q2", "back": "A, 2"}]
        created = api.create_cards(self.deck.name, frappe.as_json(cards))
        self.assertEqual([(c["front"], c["back"]) for c in created], [("Q1", "A1"), ("Q2", "A, 2")])
        self.assertEqual(self._card_count(), 2)

    def test_rejects_more_than_limit(self):
        cards = [{"front": "Q", "back": "A"}] * (api.BULK_ADD_LIMIT + 1)
        with self.assertRaises(frappe.ValidationError):
            api.create_cards(self.deck.name, cards)
        self.assertEqual(self._card_count(), 0)

    def test_invalid_card_raises(self):
        cards = [{"front": "Q1", "back": "A1"}, {"front": "Q2", "back": " "}]
        with self.assertRaises(frappe.ValidationError):
            api.create_cards(self.deck.name, cards)
