import frappe


def execute():
    frappe.delete_doc("DocType", "Daily Stat", ignore_missing=True, force=True)
