import frappe
from frappe.model.document import Document


class DailyStat(Document):
    def validate(self):
        if frappe.db.exists(
            "Daily Stat",
            {"date": self.date, "user": self.user, "name": ["!=", self.name]},
        ):
            frappe.throw(f"A Daily Stat for {self.date} already exists.")


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
    return f"(`tabDaily Stat`.`user` = {frappe.db.escape(user)})"
