import frappe
from frappe import _
from frappe.model.document import Document


class Card(Document):
    def validate(self):
        self.front = (self.front or "").strip()
        self.back = (self.back or "").strip()
        if not self.front or not self.back:
            frappe.throw(_("Both front and back are required."))
