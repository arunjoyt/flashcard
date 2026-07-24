import frappe
from frappe import _
from frappe.model.document import Document


class Deck(Document):
    def validate(self):
        self.deck_name = (self.deck_name or "").strip()
        if not self.deck_name:
            frappe.throw(_("Deck name is required."))
        if frappe.db.exists(
            "Deck",
            {"deck_name": self.deck_name, "user": self.user, "name": ["!=", self.name]},
        ):
            frappe.throw(_("You already have a deck named {0}.").format(self.deck_name))

    def on_trash(self):
        for card_name in frappe.get_all("Card", filters={"deck": self.name}, pluck="name"):
            frappe.delete_doc("Card", card_name, ignore_permissions=True)


def _bypasses_user_scoping(user):
    return user == "Administrator" or "System Manager" in frappe.get_roles(user)


def has_permission(doc, ptype=None, user=None, debug=False):
    user = user or frappe.session.user
    if _bypasses_user_scoping(user):
        return True
    return doc.user == user


def get_permission_query_conditions(user=None, doctype=None):
    user = user or frappe.session.user
    if _bypasses_user_scoping(user):
        return ""
    return f"(`tabDeck`.`user` = {frappe.db.escape(user)})"
