import frappe
from frappe import _
from frappe.model.document import Document


class Card(Document):
    def validate(self):
        self.front = (self.front or "").strip()
        self.back = (self.back or "").strip()
        if not self.front or not self.back:
            frappe.throw(_("Both front and back are required."))

    def before_insert(self):
        self.user = frappe.db.get_value("Deck", self.deck, "user")


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
    return f"(`tabCard`.`user` = {frappe.db.escape(user)})"
