import frappe
from frappe.model.document import Document


class Deck(Document):
    def on_trash(self):
        for card_name in frappe.get_all("Card", filters={"deck": self.name}, pluck="name"):
            frappe.delete_doc("Card", card_name, ignore_permissions=True)
