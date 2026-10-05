import frappe
from frappe import _


def _get_owned_deck(deck_name):
    deck = frappe.get_doc("Deck", deck_name)
    deck.check_permission("read")
    return deck


@frappe.whitelist()
def get_decks():
    decks = frappe.get_all(
        "Deck",
        fields=["name", "deck_name"],
        filters={"user": frappe.session.user},
        order_by="creation desc",
    )
    counts_by_deck = {
        row.deck: row.count
        for row in frappe.get_all(
            "Card",
            fields=["deck", {"COUNT": "name", "as": "count"}],
            filters={"user": frappe.session.user},
            group_by="deck",
        )
    }
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
def update_deck(deck_name, new_name):
    doc = frappe.get_doc("Deck", deck_name)
    doc.check_permission("write")
    doc.deck_name = new_name
    doc.save()
    return {"name": doc.name, "deck_name": doc.deck_name}


@frappe.whitelist()
def delete_deck(deck_name):
    _get_owned_deck(deck_name)
    frappe.delete_doc("Deck", deck_name)


@frappe.whitelist()
def get_deck(deck_name):
    deck = _get_owned_deck(deck_name)
    cards = frappe.get_all(
        "Card",
        filters={"deck": deck_name},
        fields=["name", "front", "back"],
        order_by="creation asc",
    )
    return {"name": deck.name, "deck_name": deck.deck_name, "cards": cards}


@frappe.whitelist()
def create_card(deck_name, front, back):
    _get_owned_deck(deck_name)
    doc = frappe.get_doc(
        {"doctype": "Card", "deck": deck_name, "front": front, "back": back}
    ).insert()
    return {"name": doc.name, "front": doc.front, "back": doc.back}


BULK_ADD_LIMIT = 500


@frappe.whitelist()
def create_cards(deck_name, cards):
    """Bulk Add: insert all cards or none. Frappe rolls back the request on any error."""
    _get_owned_deck(deck_name)
    cards = frappe.parse_json(cards) or []
    if len(cards) > BULK_ADD_LIMIT:
        frappe.throw(_("You can add at most {0} cards at once.").format(BULK_ADD_LIMIT))
    created = []
    for card in cards:
        doc = frappe.get_doc(
            {"doctype": "Card", "deck": deck_name, "front": card.get("front"), "back": card.get("back")}
        ).insert()
        created.append({"name": doc.name, "front": doc.front, "back": doc.back})
    return created


@frappe.whitelist()
def update_card(card_name, front, back):
    doc = frappe.get_doc("Card", card_name)
    doc.check_permission("write")
    doc.front = front
    doc.back = back
    doc.save()
    return {"name": doc.name, "front": doc.front, "back": doc.back}


@frappe.whitelist()
def delete_card(card_name):
    frappe.get_doc("Card", card_name).check_permission("delete")
    frappe.delete_doc("Card", card_name)


@frappe.whitelist()
def get_all_cards():
    return frappe.get_all(
        "Card",
        filters={"user": frappe.session.user},
        fields=["name", "deck", "front", "back"],
        order_by="creation asc",
    )

