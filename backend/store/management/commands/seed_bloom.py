from decimal import Decimal

from django.core.management.base import BaseCommand

from store.models import Category, Product, ProductImage


IMAGE_ROOT = (
    "https://nkyzxoxszgiqolwgwqzc.supabase.co/storage/v1/object/public/"
    "product-images/3265fdd4-1165-48d3-8943-5ac0bbb48f2a/"
)

CATALOG = [
    {
        "category": "Plaisir d'offrir",
        "category_description": "Des créations choisies pour offrir une attention fleurie.",
        "name": "Fresca",
        "description": "Un bouquet frais et contemporain composé de roses, de lys, de gypsophile et d'une touche d'orchidée.",
        "price": Decimal("75000.00"),
        "color": "Rose, blanc et vert d'eau",
        "occasion": Product.Occasion.OTHER,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/plaisir-doffrir/fresca",
        "image": "1778981331709-4hh8p3qy87s.jpeg",
    },
    {
        "category": "Plaisir d'offrir",
        "category_description": "Des créations choisies pour offrir une attention fleurie.",
        "name": "Rhapsodie Florale",
        "description": "Une composition architecturale de roses, lys et chrysanthèmes, pensée pour les grandes occasions.",
        "price": Decimal("100000.00"),
        "color": "Rouge, pêche et blanc",
        "occasion": Product.Occasion.CELEBRATION,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/plaisir-doffrir/rhapsodie-florale",
        "image": "1778978097349-y10tir7x2ko.jpeg",
    },
    {
        "category": "Plaisir d'offrir",
        "category_description": "Des créations choisies pour offrir une attention fleurie.",
        "name": "Akoma",
        "description": "Un bouquet inspiré du symbole Adinkra Akoma, mêlant roses, limonium et feuillage de saison.",
        "price": Decimal("45000.00"),
        "color": "Rouge, rose et mauve",
        "occasion": Product.Occasion.VALENTINE,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/plaisir-doffrir/akoma",
        "image": "1778967076898-ov9r44c1ph.jpeg",
    },
    {
        "category": "Plaisir d'offrir",
        "category_description": "Des créations choisies pour offrir une attention fleurie.",
        "name": "Pétales sucrées",
        "description": "Des roses blanches et roses entourées d'un nuage de gypsophile pour une composition généreuse.",
        "price": Decimal("85000.00"),
        "color": "Rose poudré et blanc",
        "occasion": Product.Occasion.VALENTINE,
        "is_featured": False,
        "source_url": "https://www.lartisanefleuriste.com/boutique/plaisir-doffrir/petales-sucrees-mp4epd5c",
        "image": "1778697718825-h7cb5jl31c.jpeg",
    },
    {
        "category": "Naissance",
        "category_description": "Des attentions tendres pour accueillir un nouveau-né.",
        "name": "Ultime Floraison",
        "description": "Une composition blanche sculpturale rehaussée de vert amande et présentée dans un vase sobre.",
        "price": Decimal("80000.00"),
        "color": "Blanc et vert amande",
        "occasion": Product.Occasion.BIRTH,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/naissance/ultime-floraison",
        "image": "1778982546771-wdsp86vth8l.jpeg",
    },
    {
        "category": "Naissance",
        "category_description": "Des attentions tendres pour accueillir un nouveau-né.",
        "name": "Akwaba — Petit Prince",
        "description": "Une composition lumineuse imaginée pour souhaiter la bienvenue à un petit garçon.",
        "price": Decimal("60000.00"),
        "color": "Bleu, blanc et jaune",
        "occasion": Product.Occasion.BIRTH,
        "is_featured": False,
        "source_url": "https://www.lartisanefleuriste.com/boutique/naissance/akwaba-petit-prince",
        "image": "1778709915694-dinjwbkq0en.jpeg",
    },
    {
        "category": "Paniers Fleuris",
        "category_description": "La signature historique de la maison en vannerie fleurie.",
        "name": "Pétales et vannerie",
        "description": "Un panier tressé garni de fleurs solaires et de roses dans une composition vivante et texturée.",
        "price": Decimal("50000.00"),
        "color": "Rose et tons solaires",
        "occasion": Product.Occasion.CELEBRATION,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/paniers-fleuris/petales-et-vannerie",
        "image": "1779226826279-t38ngd8bh39.jpeg",
    },
    {
        "category": "Écrin Fleuri",
        "category_description": "Des arrangements présentés comme de véritables écrins.",
        "name": "Box Katiola-Bassam",
        "description": "Une box florale inspirée des cultures ivoiriennes, associant orchidées tigrées et détails symboliques.",
        "price": Decimal("75000.00"),
        "color": "Orange, rose et vert",
        "occasion": Product.Occasion.OTHER,
        "is_featured": True,
        "source_url": "https://www.lartisanefleuriste.com/boutique/ecrin-fleuri/box-katiola-bassam",
        "image": "1778709846625-fntkfpwyid5.jpeg",
    },
    {
        "category": "Écrin Fleuri",
        "category_description": "Des arrangements présentés comme de véritables écrins.",
        "name": "Harmonie ensoleillée",
        "description": "Une composition rayonnante où les roses rencontrent la légèreté champêtre des marguerites.",
        "price": Decimal("50000.00"),
        "color": "Jaune, pêche et blanc",
        "occasion": Product.Occasion.CELEBRATION,
        "is_featured": False,
        "source_url": "https://www.lartisanefleuriste.com/boutique/ecrin-fleuri/harmonie-ensoleillee",
        "image": "1778527492442-1ys6pihnpyj.jpeg",
    },
]


class Command(BaseCommand):
    help = "Ajoute le catalogue autorisé de L'Artisane Fleuriste."

    def handle(self, *args, **options):
        created_products = 0

        for entry in CATALOG:
            category, _ = Category.objects.update_or_create(
                name=entry["category"],
                defaults={
                    "description": entry["category_description"],
                    "is_active": True,
                },
            )
            product, created = Product.objects.update_or_create(
                name=entry["name"],
                defaults={
                    "category": category,
                    "description": entry["description"],
                    "price": entry["price"],
                    "stock": 10,
                    "color": entry["color"],
                    "occasion": entry["occasion"],
                    "is_active": True,
                    "is_featured": entry["is_featured"],
                    "source_url": entry["source_url"],
                },
            )
            ProductImage.objects.update_or_create(
                product=product,
                position=0,
                defaults={
                    "image_url": f"{IMAGE_ROOT}{entry['image']}",
                    "alt_text": entry["name"],
                },
            )
            created_products += int(created)

        self.stdout.write(
            self.style.SUCCESS(
                f"Catalogue officiel prêt : {len(CATALOG)} produits, "
                f"dont {created_products} nouvellement créés."
            )
        )
