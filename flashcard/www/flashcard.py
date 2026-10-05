import frappe

import flashcard

no_cache = 1


def get_context(context):
    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = "/login?redirect-to=/flashcard"
        raise frappe.Redirect
    context.boot = frappe._dict(
        {
            "site_name": frappe.local.site,
            "csrf_token": frappe.sessions.get_csrf_token(),
            "app_version": flashcard.__version__,
            # get_fullname falls back to the user ID (email) when the full name is empty.
            "user_full_name": frappe.utils.get_fullname(frappe.session.user),
        }
    )
