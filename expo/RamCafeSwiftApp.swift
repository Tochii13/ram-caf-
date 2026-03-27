import SwiftUI

// MARK: - Models

enum MealPeriod: String, CaseIterable, Codable {
    case breakfast, lunch, dinner, brunch
}

enum DietaryTag: String, CaseIterable, Codable {
    case vegetarian, vegan, glutenFree, highProtein, dairyFree, nutFree, halal

    var label: String {
        switch self {
        case .vegetarian: return "Vegetarian"
        case .vegan: return "Vegan"
        case .glutenFree: return "Gluten‑Free"
        case .highProtein: return "High Protein"
        case .dairyFree: return "Dairy‑Free"
        case .nutFree: return "Nut‑Free"
        case .halal: return "Halal"
        }
    }

    var emoji: String {
        switch self {
        case .vegetarian: return "🥦"
        case .vegan: return "🌱"
        case .glutenFree: return "🌾"
        case .highProtein: return "💪"
        case .dairyFree: return "🥛"
        case .nutFree: return "🥜"
        case .halal: return "☪️"
        }
    }
}

enum Allergen: String, CaseIterable, Codable {
    case nuts, dairy, shellfish, gluten, soy, eggs, pork

    var label: String {
        switch self {
        case .nuts: return "Tree Nuts"
        case .dairy: return "Dairy"
        case .shellfish: return "Shellfish"
        case .gluten: return "Gluten"
        case .soy: return "Soy"
        case .eggs: return "Eggs"
        case .pork: return "Pork"
        }
    }
}

struct NutritionFacts: Codable {
    var protein: Int
    var carbs: Int
    var fat: Int
    var fiber: Int
}

struct MenuItemModel: Identifiable, Codable {
    var id: String
    var name: String
    var description: String
    var calories: Int
    var emoji: String
    var dietaryTags: [DietaryTag]
    var mealPeriod: MealPeriod
    var allergens: [Allergen]
    var ingredients: String
    var nutrition: NutritionFacts
}

struct CafeHours: Identifiable {
    var id: String { mealPeriod.rawValue }
    var mealPeriod: MealPeriod
    var startTime: String
    var endTime: String
}

struct WeeklyMenuItemModel: Identifiable {
    var id: String
    var name: String
    var description: String
    var calories: Int
    var dietaryTags: [DietaryTag]
    var mealPeriod: MealPeriod
    var emoji: String
}

struct WeeklyDay: Identifiable {
    var id: String
    var weekday: String
    var dateLabel: String
    var items: [WeeklyMenuItemModel]
}

// MARK: - Sample Data (mirrors React Native app)

struct SampleData {
    static let menuItems: [MenuItemModel] = {
        func makeItem(
            _ id: String,
            _ name: String,
            _ description: String,
            _ calories: Int,
            _ emoji: String,
            _ tags: [DietaryTag],
            _ period: MealPeriod,
            _ allergens: [Allergen],
            _ ingredients: String,
            _ nutrition: NutritionFacts
        ) -> MenuItemModel {
            .init(
                id: id,
                name: name,
                description: description,
                calories: calories,
                emoji: emoji,
                dietaryTags: tags,
                mealPeriod: period,
                allergens: allergens,
                ingredients: ingredients,
                nutrition: nutrition
            )
        }

        return [
            makeItem(
                "1",
                "Fluffy Pancakes",
                "Light and fluffy pancakes served with maple syrup.",
                420,
                "🍽️",
                [.vegetarian],
                .breakfast,
                [.gluten, .dairy, .eggs],
                "Enriched flour, eggs, milk, butter, baking powder, sugar, vanilla, maple syrup.",
                .init(protein: 8, carbs: 64, fat: 10, fiber: 2)
            ),
            makeItem(
                "2",
                "Veggie Omelette",
                "Three‑egg omelette packed with fresh vegetables.",
                340,
                "🍽️",
                [.vegetarian, .glutenFree],
                .breakfast,
                [.eggs, .dairy],
                "Eggs, bell peppers, onion, mushrooms, spinach, olive oil, salt, pepper.",
                .init(protein: 22, carbs: 6, fat: 18, fiber: 2)
            ),
            makeItem(
                "3",
                "Overnight Oats",
                "Creamy oats topped with fresh berries.",
                290,
                "🍽️",
                [.vegan, .highProtein],
                .breakfast,
                [.gluten, .dairy],
                "Rolled oats, almond milk, chia seeds, blueberries, strawberries, honey.",
                .init(protein: 12, carbs: 45, fat: 6, fiber: 6)
            ),
            makeItem(
                "11",
                "Crispy Bacon & Eggs",
                "Smoky bacon strips served with scrambled eggs and toast.",
                520,
                "🍽️",
                [.highProtein],
                .breakfast,
                [.pork, .eggs, .dairy, .gluten],
                "Pork bacon, eggs, butter, milk, toast, salt, pepper.",
                .init(protein: 26, carbs: 24, fat: 34, fiber: 2)
            ),
            makeItem(
                "12",
                "BBQ Pulled Pork Sandwich",
                "Slow‑cooked pulled pork on a toasted bun with slaw.",
                640,
                "🍽️",
                [],
                .lunch,
                [.pork, .gluten],
                "Pulled pork, BBQ sauce, brioche bun, cabbage slaw, pickles.",
                .init(protein: 32, carbs: 58, fat: 26, fiber: 3)
            )
        ]
    }()

    static let cafeHoursWeekday: [CafeHours] = [
        .init(mealPeriod: .breakfast, startTime: "7:00 AM", endTime: "9:00 AM"),
        .init(mealPeriod: .lunch, startTime: "11:00 AM", endTime: "1:30 PM"),
        .init(mealPeriod: .dinner, startTime: "5:00 PM", endTime: "7:00 PM")
    ]

    static let cafeHoursWeekend: [CafeHours] = [
        .init(mealPeriod: .brunch, startTime: "11:00 AM", endTime: "1:30 PM"),
        .init(mealPeriod: .dinner, startTime: "4:30 PM", endTime: "6:00 PM")
    ]
}

// MARK: - Session Store

final class SessionStore: ObservableObject {
    @Published var isAuthenticated = false
    @Published var needsOnboarding = true

    @Published var name: String = "Student"
    @Published var dietaryPreferences: Set<DietaryTag> = []
    @Published var allergies: Set<Allergen> = []
    @Published var otherDietary: [String] = []
    @Published var otherAllergies: [String] = []

    func completeOnboarding(
        dietary: Set<DietaryTag>,
        allergies: Set<Allergen>,
        otherDietary: [String],
        otherAllergies: [String]
    ) {
        self.dietaryPreferences = dietary
        self.allergies = allergies
        self.otherDietary = otherDietary
        self.otherAllergies = otherAllergies
        self.needsOnboarding = false
        self.isAuthenticated = true
    }
}

// MARK: - Root App

@main
struct RamCafeSwiftApp: App {
    @StateObject private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
        }
    }
}

// MARK: - Root Navigation

struct RootView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        if !session.isAuthenticated {
            AuthView()
        } else if session.needsOnboarding {
            OnboardingFlowView()
        } else {
            MainTabView()
        }
    }
}

// MARK: - Auth

struct AuthView: View {
    @EnvironmentObject var session: SessionStore
    @State private var name: String = ""

    var body: some View {
        VStack(spacing: 24) {
            Text("Ram Café")
                .font(.largeTitle).bold()
            Text("Sign in to see today’s menu.")
                .foregroundColor(.secondary)

            TextField("Your name", text: $name)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal, 32)

            Button {
                session.name = name.isEmpty ? "Student" : name
                session.needsOnboarding = true
                session.isAuthenticated = true
            } label: {
                Text("Continue")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.61, green: 0.25, blue: 0.25))
                    .foregroundColor(.white)
                    .cornerRadius(14)
                    .padding(.horizontal, 32)
            }
        }
    }
}

// MARK: - Onboarding

struct OnboardingFlowView: View {
    @EnvironmentObject var session: SessionStore
    @State private var step: Int = 0
    @State private var selectedDietary: Set<DietaryTag> = []
    @State private var selectedAllergies: Set<Allergen> = []
    @State private var otherDietaryText: String = ""
    @State private var otherAllergyText: String = ""

    var body: some View {
        VStack {
            HStack(spacing: 8) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(index <= step ? Color(red: 0.61, green: 0.25, blue: 0.25) : Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.bottom, 24)

            if step == 0 {
                VStack(spacing: 16) {
                    Text("Welcome, \(session.name)!").font(.title).bold()
                    Text("Let’s personalize your dining experience.\nIt’ll only take a moment.")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                    Button("Let’s Go →") { step = 1 }
                        .buttonStyle(PrimaryButtonStyle())
                }
                .padding(.horizontal, 24)
            } else if step == 1 {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Any dietary preferences or restrictions?").font(.title2).bold()
                    Text("We’ll highlight menu items that match and show cautions when items contain ingredients you avoid.")
                        .foregroundColor(.secondary)
                    Text("For example: vegetarian or vegan, gluten‑free, dairy‑free, nut‑free, halal, or higher‑protein.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    ScrollView {
                        VStack(spacing: 10) {
                            ForEach(DietaryTag.allCases, id: \.self) { tag in
                                Toggle(isOn: Binding(
                                    get: { selectedDietary.contains(tag) },
                                    set: { isOn in
                                        if isOn { selectedDietary.insert(tag) } else { selectedDietary.remove(tag) }
                                    }
                                )) {
                                    HStack {
                                        Text(tag.emoji)
                                        Text(tag.label)
                                    }
                                }
                                .toggleStyle(SwitchToggleStyle(tint: Color(red: 0.61, green: 0.25, blue: 0.25)))
                            }
                        }
                        .padding(.top, 8)
                    }
                    Text("Other (comma‑separated)")
                        .font(.subheadline).bold()
                    TextField("e.g. low sodium, no pork", text: $otherDietaryText)
                        .textFieldStyle(.roundedBorder)
                    Button("Continue →") { step = 2 }
                        .buttonStyle(PrimaryButtonStyle())
                        .padding(.top, 8)
                }
                .padding(.horizontal, 24)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Any food allergies?").font(.title2).bold()
                    Text("We’ll show a caution on menu items that contain these. Select all that apply.")
                        .foregroundColor(.secondary)
                    Text("For example: nuts, dairy, eggs, shellfish, gluten, soy, or pork.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    ScrollView {
                        VStack(spacing: 10) {
                            ForEach(Allergen.allCases, id: \.self) { allergen in
                                Toggle(isOn: Binding(
                                    get: { selectedAllergies.contains(allergen) },
                                    set: { isOn in
                                        if isOn { selectedAllergies.insert(allergen) } else { selectedAllergies.remove(allergen) }
                                    }
                                )) {
                                    Text(allergen.label)
                                }
                                .toggleStyle(SwitchToggleStyle(tint: Color(red: 0.61, green: 0.25, blue: 0.25)))
                            }
                        }
                        .padding(.top, 8)
                    }
                    Text("Other allergies (comma‑separated)")
                        .font(.subheadline).bold()
                    TextField("e.g. sesame, kiwi", text: $otherAllergyText)
                        .textFieldStyle(.roundedBorder)
                    Button("Start Exploring →") {
                        let otherDietary = otherDietaryText
                            .split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                        let otherAllergies = otherAllergyText
                            .split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                        session.completeOnboarding(
                            dietary: selectedDietary,
                            allergies: selectedAllergies,
                            otherDietary: otherDietary,
                            otherAllergies: otherAllergies
                        )
                    }
                        .buttonStyle(PrimaryButtonStyle())
                        .padding(.top, 8)
                }
                .padding(.horizontal, 24)
            }
        }
        .padding(.vertical, 24)
    }
}

// MARK: - Main Tabs

struct MainTabView: View {
    var body: some View {
        TabView {
            TodayView()
                .tabItem {
                    Image(systemName: "sun.max.fill")
                    Text("Today")
                }
            WeeklyView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Weekly")
                }
            SettingsRootView()
                .tabItem {
                    Image(systemName: "gearshape")
                    Text("Settings")
                }
        }
    }
}

// MARK: - Today

struct TodayView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        let name = session.name.split(separator: " ").first.map(String.init) ?? "Student"
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(greeting(for: name))
                    .font(.system(size: 32, weight: .bold))
                Text("Here’s today’s menu")
                    .foregroundColor(.secondary)

                TodayHoursSection()

                Text("Today’s Menu")
                    .font(.headline)

                ForEach(SampleData.menuItems) { item in
                    MenuItemCardSwift(item: item)
                }
            }
            .padding()
        }
    }

    private func greeting(for name: String) -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "Good Morning, \(name)! 👋" }
        if hour < 17 { return "Good Afternoon, \(name)! 👋" }
        return "Good Evening, \(name)! 👋"
    }
}

struct TodayHoursSection: View {
    var body: some View {
        let isWeekend = Calendar.current.isDateInWeekend(Date())
        let hours = isWeekend ? SampleData.cafeHoursWeekend : SampleData.cafeHoursWeekday

        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Today’s Hours").font(.headline)
                Spacer()
                Text("Open Now")
                    .font(.caption).bold()
                    .padding(.horizontal, 10).padding(.vertical, 4)
                    .background(Color.green.opacity(0.8))
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            ForEach(hours) { h in
                HStack {
                    Text(label(for: h.mealPeriod))
                        .font(.subheadline).bold()
                        .padding(.horizontal, 10).padding(.vertical, 4)
                        .background(Color(.systemGray5))
                        .cornerRadius(8)
                    Text("\(h.startTime) – \(h.endTime)")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }

    private func label(for period: MealPeriod) -> String {
        switch period {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        case .brunch: return "Brunch"
        }
    }
}

// MARK: - Weekly

struct WeeklyView: View {
    @EnvironmentObject var session: SessionStore

    // Simple static weekly days for the demo
    private let days: [WeeklyDay] = {
        let baseItems = SampleData.menuItems
        func day(_ id: String, _ label: String, _ weekday: String, _ ids: [String]) -> WeeklyDay {
            WeeklyDay(
                id: id,
                weekday: weekday,
                dateLabel: label,
                items: ids.compactMap { id in
                    guard let item = baseItems.first(where: { $0.id == id }) else { return nil }
                    return WeeklyMenuItemModel(
                        id: "w-\(id)-\(weekday)",
                        name: item.name,
                        description: item.description,
                        calories: item.calories,
                        dietaryTags: item.dietaryTags,
                        mealPeriod: item.mealPeriod,
                        emoji: item.emoji
                    )
                }
            )
        }
        return [
            day("mon", "Mar 9", "Monday", ["1", "2", "3"]),
            day("tue", "Mar 10", "Tuesday", ["3", "12"]),
            day("wed", "Mar 11", "Wednesday", ["1", "11"]),
        ]
    }()

    @State private var selectedIndex: Int = 0

    var body: some View {
        let selectedDay = days[selectedIndex]

        VStack(alignment: .leading, spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(days.enumerated()), id: \.1.id) { index, day in
                        let selected = index == selectedIndex
                        VStack(spacing: 4) {
                            Text(day.weekday.prefix(3).uppercased())
                                .font(.caption)
                                .foregroundColor(selected ? Color(red: 0.61, green: 0.25, blue: 0.25) : .secondary)
                            ZStack {
                                Circle()
                                    .fill(selected ? Color(red: 0.61, green: 0.25, blue: 0.25) : Color(.systemGray5))
                                    .frame(width: 32, height: 32)
                                Text(day.dateLabel.split(separator: " ").last ?? "")
                                    .foregroundColor(selected ? .white : .primary)
                                    .font(.subheadline).bold()
                            }
                        }
                        .padding(.vertical, 8)
                        .padding(.horizontal, 6)
                        .onTapGesture { selectedIndex = index }
                    }
                }
                .padding(.horizontal)
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Text("\(selectedDay.weekday), \(selectedDay.dateLabel)")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                    ForEach(selectedDay.items) { item in
                        MenuItemCardSwift(item: SampleData.menuItems.first(where: { $0.name == item.name }) ?? SampleData.menuItems[0])
                    }
                }
                .padding(.top, 8)
            }
        }
    }
}

// MARK: - Settings

struct SettingsRootView: View {
    @EnvironmentObject var session: SessionStore
    @State private var showDietary = false
    @State private var showAllergies = false

    var body: some View {
        NavigationStack {
            List {
                Section("Profile") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(session.name).font(.headline)
                        Text(dietarySummary)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                Section("Preferences & Allergies") {
                    Button("Dietary preferences") { showDietary = true }
                    Button("Allergies") { showAllergies = true }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showDietary) {
                DietarySettingsSheet()
                    .environmentObject(session)
            }
            .sheet(isPresented: $showAllergies) {
                AllergySettingsSheet()
                    .environmentObject(session)
            }
        }
    }

    private var dietarySummary: String {
        let labels = session.dietaryPreferences.map(\.label).sorted()
        if labels.isEmpty { return "No preferences set" }
        return labels.joined(separator: ", ")
    }
}

struct DietarySettingsSheet: View {
    @EnvironmentObject var session: SessionStore
    @Environment(\.dismiss) var dismiss
    @State private var local: Set<DietaryTag> = []
    @State private var otherText: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Dietary preferences") {
                    ForEach(DietaryTag.allCases, id: \.self) { tag in
                        Toggle(isOn: Binding(
                            get: { local.contains(tag) },
                            set: { isOn in
                                if isOn { local.insert(tag) } else { local.remove(tag) }
                            }
                        )) {
                            Text("\(tag.emoji) \(tag.label)")
                        }
                    }
                }
                Section("Other (comma‑separated)") {
                    TextField("e.g. low sodium, no pork", text: $otherText)
                }
            }
            .navigationTitle("Dietary")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        session.dietaryPreferences = local
                        session.otherDietary = otherText
                            .split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                local = session.dietaryPreferences
                otherText = session.otherDietary.joined(separator: ", ")
            }
        }
    }
}

struct AllergySettingsSheet: View {
    @EnvironmentObject var session: SessionStore
    @Environment(\.dismiss) var dismiss
    @State private var local: Set<Allergen> = []
    @State private var otherText: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Allergies") {
                    ForEach(Allergen.allCases, id: \.self) { allergen in
                        Toggle(isOn: Binding(
                            get: { local.contains(allergen) },
                            set: { isOn in
                                if isOn { local.insert(allergen) } else { local.remove(allergen) }
                            }
                        )) {
                            Text(allergen.label)
                        }
                    }
                }
                Section("Other allergies (comma‑separated)") {
                    TextField("e.g. sesame, kiwi", text: $otherText)
                }
            }
            .navigationTitle("Allergies")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        session.allergies = local
                        session.otherAllergies = otherText
                            .split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                local = session.allergies
                otherText = session.otherAllergies.joined(separator: ", ")
            }
        }
    }
}

// MARK: - Shared Menu Card (Swift)

struct MenuItemCardSwift: View {
    @EnvironmentObject var session: SessionStore
    let item: MenuItemModel

    private var conflictAllergens: [Allergen] {
        // Conflicts from explicit allergies
        var set = Set(item.allergens).intersection(session.allergies)

        // Dietary-based conflicts (similar to React Native)
        if session.dietaryPreferences.contains(.glutenFree), item.allergens.contains(.gluten) {
            set.insert(.gluten)
        }
        if session.dietaryPreferences.contains(.vegan) {
            if item.allergens.contains(.dairy) { set.insert(.dairy) }
            if item.allergens.contains(.eggs) { set.insert(.eggs) }
        }
        if session.dietaryPreferences.contains(.dairyFree), item.allergens.contains(.dairy) {
            set.insert(.dairy)
        }
        if session.dietaryPreferences.contains(.nutFree), item.allergens.contains(.nuts) {
            set.insert(.nuts)
        }
        if session.dietaryPreferences.contains(.halal), item.allergens.contains(.pork) {
            set.insert(.pork)
        }
        return Array(set)
    }

    private var warningText: String {
        conflictAllergens.map { $0.label }.joined(separator: ", ")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top, spacing: 12) {
                Text(item.emoji)
                    .font(.largeTitle)
                    .frame(width: 44, height: 44)
                    .background(Color(.systemGray5))
                    .cornerRadius(12)
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(item.calories) cal")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(item.name)
                        .font(.headline)
                    Text(item.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    HStack(spacing: 6) {
                        ForEach(item.dietaryTags, id: \.self) { tag in
                            Text("\(tag.emoji) \(tag.label)")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color(red: 0.61, green: 0.25, blue: 0.25).opacity(0.12))
                                .foregroundColor(Color(red: 0.61, green: 0.25, blue: 0.25))
                                .cornerRadius(999)
                        }
                    }
                    if !conflictAllergens.isEmpty {
                        Text("Caution: contains \(warningText)")
                            .font(.caption)
                            .foregroundColor(.orange)
                            .fontWeight(.semibold)
                            .padding(.top, 4)
                    }
                }
            }
        }
        .padding(14)
        .background(Color(.systemBackground))
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.04), radius: 3, x: 0, y: 1)
    }
}

// MARK: - Button Style

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(red: 0.61, green: 0.25, blue: 0.25))
            .foregroundColor(.white)
            .cornerRadius(14)
            .padding(.horizontal, 8)
            .opacity(configuration.isPressed ? 0.85 : 1.0)
    }
}

