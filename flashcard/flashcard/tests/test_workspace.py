import frappe
from frappe.tests.utils import FrappeTestCase


class TestFlashcardWorkspace(FrappeTestCase):
    def test_flashcard_workspace_exists(self):
        self.assertTrue(frappe.db.exists("Workspace", "Flashcard"))

    def test_flashcard_workspace_doctype_shortcuts_resolve(self):
        shortcuts = frappe.get_all(
            "Workspace Shortcut",
            filters={"parent": "Flashcard", "type": "DocType"},
            pluck="link_to",
        )
        self.assertCountEqual(shortcuts, ["Deck", "Card"])
        for doctype in shortcuts:
            self.assertTrue(frappe.db.exists("DocType", doctype))
