import urllib.request
import urllib.parse
import json
import csv
import time

API_KEY = "lr7u1yr6tXBFTariQzIcWqkz9de0vIJ2EHqaqEFy"

FOODS = [
    "apple", "banana", "mango",
]

def clean_query(name):
    for prefix in ["Pasta - ", "Rice - ", "Bread - ", "Milk - ", "Oat Milk - ",
                   "Almond Milk - ", "Soy Milk - ", "Greek Yogurt - ", "Yogurt - ",
                   "Protein Yogurt - ", "Cheese - ", "Protein Powder - ", "Protein Bar - ",
                   "Bell Pepper - ", "Mushrooms - ", "Grapes - ", "Apple - ", "Orange - "]:
        if name.startswith(prefix):
            name = name[len(prefix):]
            break
    name = name.replace("Tortilla - ", "tortilla ")
    return name

def get_macro(nutrients, keyword):
    for n in nutrients:
        nm = n.get("nutrientName", "").lower()
        if keyword.lower() in nm:
            return round(n.get("value", 0), 1)
    return None

def search_food(query):
    params = urllib.parse.urlencode({"query": query, "pageSize": 5, "api_key": API_KEY})
    url = f"https://api.nal.usda.gov/fdc/v1/foods/search?{params}"
    with urllib.request.urlopen(url, timeout=10) as r:
        data = json.loads(r.read())
    results = []
    for f in data.get("foods", []):
        nuts = f.get("foodNutrients", [])
        cal = get_macro(nuts, "energy")
        pro = get_macro(nuts, "protein")
        carb = get_macro(nuts, "carbohydrate")
        fat = get_macro(nuts, "total lipid")
        if cal is not None:
            results.append({
                "description": f.get("description", ""),
                "brand": f.get("brandOwner", ""),
                "calories": cal,
                "protein": pro,
                "carbs": carb,
                "fat": fat,
            })
    return results

def main():
    output = []
    errors = []
    total = len(FOODS)

    for i, name in enumerate(FOODS):
        query = clean_query(name)
        print(f"[{i+1}/{total}] {name}...", end=" ", flush=True)
        try:
            results = search_food(query)
            if results:
                best = results[0]
                print(f"✓ {best['description'][:50]}")
                output.append({
                    "name": name,
                    "usda_match": best["description"],
                    "brand": best["brand"],
                    "calories": best["calories"],
                    "protein_g": best["protein"],
                    "carbs_g": best["carbs"],
                    "fat_g": best["fat"],
                })
            else:
                print("no results")
                errors.append(name)
                output.append({"name": name, "usda_match": "NO MATCH", "brand": "", "calories": "", "protein_g": "", "carbs_g": "", "fat_g": ""})
        except Exception as e:
            print(f"error: {e}")
            errors.append(name)
            output.append({"name": name, "usda_match": "ERROR", "brand": "", "calories": "", "protein_g": "", "carbs_g": "", "fat_g": ""})
        time.sleep(0.3)

    with open("food_macros.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "usda_match", "brand", "calories", "protein_g", "carbs_g", "fat_g"])
        writer.writeheader()
        writer.writerows(output)

    print(f"\nDone! Saved to food_macros.csv")
    print(f"Matched: {total - len(errors)}/{total}")
    if errors:
        print(f"Failed ({len(errors)}): {', '.join(errors)}")

if __name__ == "__main__":
    main()