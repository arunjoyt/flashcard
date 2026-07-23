app_name = "flashcard"
app_title = "Flashcard"
app_publisher = "22Logic"
app_description = "A simple flashcard app"
app_email = "contact22logic@gmail.com"
app_license = "mit"

website_route_rules = [
    {"from_route": "/flashcard/<path:app_path>", "to_route": "flashcard"},
]
