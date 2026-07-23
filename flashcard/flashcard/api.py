import frappe
from frappe import _


@frappe.whitelist()
def get_decks():
    decks = frappe.get_all("Deck", fields=["name"], order_by="creation desc")
    counts_by_deck = {row.deck: row.count for row in frappe.get_all(
        "Card", fields=["deck", "count(name) as count"], group_by="deck"
    )}
    for deck in decks:
        deck["card_count"] = counts_by_deck.get(deck["name"], 0)
    return decks


@frappe.whitelist()
def create_deck(deck_name):
    deck_name = (deck_name or "").strip()
    if not deck_name:
        frappe.throw(_("Deck name is required."))
    doc = frappe.get_doc({"doctype": "Deck", "deck_name": deck_name}).insert()
    return doc.name


@frappe.whitelist()
def delete_deck(deck_name):
    frappe.delete_doc("Deck", deck_name)


@frappe.whitelist()
def get_deck(deck_name):
    deck = frappe.get_doc("Deck", deck_name)
    cards = frappe.get_all(
        "Card",
        filters={"deck": deck_name},
        fields=["name", "front", "back"],
        order_by="creation asc",
    )
    return {"name": deck.name, "cards": cards}


@frappe.whitelist()
def create_card(deck_name, front, back):
    doc = frappe.get_doc(
        {"doctype": "Card", "deck": deck_name, "front": front, "back": back}
    ).insert()
    return {"name": doc.name, "front": doc.front, "back": doc.back}


@frappe.whitelist()
def update_card(card_name, front, back):
    doc = frappe.get_doc("Card", card_name)
    doc.front = front
    doc.back = back
    doc.save()
    return {"name": doc.name, "front": doc.front, "back": doc.back}


@frappe.whitelist()
def delete_card(card_name):
    frappe.delete_doc("Card", card_name)
