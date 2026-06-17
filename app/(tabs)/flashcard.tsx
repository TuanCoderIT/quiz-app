import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackground } from "../../src/components/common/AppBackground";
import { useFlashcardStore } from "../../src/features/flashcard/store";
import {
  FlashcardDeck,
  FlashcardSetStatus,
  FlashcardSetVisibility,
  FlashcardSourceType,
} from "../../src/features/flashcard/types";
import { AppCard } from "@/src/components";

const ALL_FILTER = "Tất cả";
const DUE_FILTER = "Cần ôn";
const FLASHCARD_PRIMARY = "#4F46E5";

const getProgress = (deck: FlashcardDeck) =>
  deck.cardCount > 0
    ? Math.round((deck.masteredCount / deck.cardCount) * 100)
    : 0;

const getCategoryLabel = (deck: FlashcardDeck) =>
  deck.category?.name || "Flashcard";

const sourceLabels: Record<FlashcardSourceType, string> = {
  manual: "Thủ công",
  quiz_wrong_answers: "Câu sai",
  ai_generated: "AI",
};

const StatItem = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <View style={styles.statItem}>
    <View style={[styles.statIcon, { backgroundColor: `${color}14` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const FeedbackCard = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.feedbackCard}>
    <Ionicons name={icon} size={38} color="#94A3B8" />
    <Text style={styles.feedbackTitle}>{title}</Text>
    <Text style={styles.feedbackText}>{message}</Text>
    {actionLabel && onAction ? (
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.feedbackAction,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.feedbackActionText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const DeckCard = ({ deck, index }: { deck: FlashcardDeck; index: number }) => {
  const router = useRouter();
  const progress = getProgress(deck);
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck);
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);

  const openDeck = () => router.push(`/flashcard/${deck.id}`);
  const startStudy = () =>
    router.push({ pathname: "/flashcard/study", params: { id: deck.id } });
  const editDeck = () =>
    router.push({
      pathname: "/flashcard/edit" as never,
      params: { id: deck.id },
    });
  const handleDelete = () => {
    Alert.alert(
      "Xóa bộ thẻ?",
      "Bộ thẻ sẽ bị xóa hoặc lưu trữ nếu backend không hỗ trợ xóa.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              void fetchDecks();
            } catch {
              Alert.alert("Không xóa được", "Vui lòng thử lại sau.");
            }
          },
        },
      ],
    );
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 90).duration(500)}
      style={styles.deckCardWrapper}
    >
      <AppCard>
        <View style={styles.deckHeader}>
          <View style={styles.deckHeaderText}>
            <Text style={styles.deckTitle} numberOfLines={1}>
              {deck.title}
            </Text>
            <Text style={styles.deckDescription}>{deck.cardCount} thẻ</Text>
          </View>
          <View style={styles.headerActionRow}>
            <Pressable
              onPress={editDeck}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.iconActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={18} color="#0F172A" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.iconDangerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={19} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>{progress}% đã thuộc</Text>
          <Text style={styles.progressMeta}>
            {deck.masteredCount}/{deck.cardCount} thẻ
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: FLASHCARD_PRIMARY },
            ]}
          />
        </View>

        <View style={styles.cardActionRow}>
          <Pressable
            onPress={openDeck}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.detailButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#0F172A" />
          </Pressable>

          <Pressable
            onPress={startStudy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.startButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Bắt đầu</Text>
              <Ionicons name="play" size={15} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </AppCard>
    </Animated.View>
  );
};

export default function FlashcardTab() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [sourceFilter, setSourceFilter] = useState<
    FlashcardSourceType | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<
    FlashcardSetStatus | undefined
  >();
  const [visibilityFilter, setVisibilityFilter] = useState<
    FlashcardSetVisibility | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");

  const decks = useFlashcardStore((state) => state.decks);
  const isLoading = useFlashcardStore((state) => state.isLoading);
  const error = useFlashcardStore((state) => state.error);
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks);
  const activeCategoryId = useMemo(() => {
    if (activeFilter === ALL_FILTER || activeFilter === DUE_FILTER) {
      return undefined;
    }

    return decks.find((deck) => getCategoryLabel(deck) === activeFilter)
      ?.category?.id;
  }, [activeFilter, decks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchDecks({
        source_type: sourceFilter,
        status: statusFilter,
        visibility: visibilityFilter,
        category_id: activeCategoryId,
        search: searchQuery.trim() || undefined,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [
    activeCategoryId,
    fetchDecks,
    searchQuery,
    sourceFilter,
    statusFilter,
    visibilityFilter,
  ]);

  const filters = useMemo(() => {
    const categoryFilters = decks
      .map((deck) => deck.category)
      .map((category) => category?.name)
      .filter((category): category is string => Boolean(category));

    return [ALL_FILTER, DUE_FILTER, ...Array.from(new Set(categoryFilters))];
  }, [decks]);

  useEffect(() => {
    if (!filters.includes(activeFilter)) {
      setActiveFilter(ALL_FILTER);
    }
  }, [activeFilter, filters]);

  const totals = useMemo(() => {
    const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
    const totalMastered = decks.reduce(
      (sum, deck) => sum + deck.masteredCount,
      0,
    );
    const dueToday = decks.reduce((sum, deck) => sum + deck.dueCount, 0);
    const progress =
      totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

    return { totalCards, totalMastered, dueToday, progress };
  }, [decks]);

  const featuredDeck = useMemo(
    () => [...decks].sort((a, b) => b.dueCount - a.dueCount)[0],
    [decks],
  );

  const filteredDecks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return decks.filter((deck) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        deck.title.toLowerCase().includes(normalizedQuery) ||
        deck.description.toLowerCase().includes(normalizedQuery) ||
        getCategoryLabel(deck).toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        activeFilter === ALL_FILTER ||
        (activeFilter === DUE_FILTER && deck.dueCount > 0) ||
        getCategoryLabel(deck) === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, decks, searchQuery]);

  const handleCreateDeck = () => {
    router.push("/flashcard/create");
  };

  const startFeaturedDeck = () => {
    if (!featuredDeck) {
      return;
    }

    router.push({
      pathname: "/flashcard/study",
      params: { id: featuredDeck.id },
    });
  };

  const refreshDecks = () => {
    void fetchDecks({
      source_type: sourceFilter,
      status: statusFilter,
      visibility: visibilityFilter,
      category_id: activeCategoryId,
      search: searchQuery.trim() || undefined,
    });
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshDecks}
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>FLASHCARDS</Text>
              <Text style={styles.title}>Ôn tập thông minh</Text>
              <Text style={styles.subtitle}>
                Theo dõi tiến độ và quay lại đúng bộ thẻ cần ôn.
              </Text>
            </View>
            <Pressable
              onPress={handleCreateDeck}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="add" size={26} color="#4F46E5" />
            </Pressable>
          </View>

          <AppCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Hôm nay cần ôn</Text>
                <Text style={styles.heroTitle}>{totals.dueToday} thẻ</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="sync" size={16} color="#F59E0B" />
                <Text style={styles.heroBadgeText}>API</Text>
              </View>
            </View>

            {featuredDeck ? (
              <>
                <Text style={styles.heroDeckTitle} numberOfLines={1}>
                  {featuredDeck.title}
                </Text>
                <Text style={styles.heroDeckMeta}>
                  {featuredDeck.dueCount} thẻ cần ôn hôm nay
                </Text>

                <View style={styles.heroProgressTrack}>
                  <View
                    style={[
                      styles.heroProgressFill,
                      { width: `${getProgress(featuredDeck)}%` },
                    ]}
                  />
                </View>

                <Pressable
                  onPress={startFeaturedDeck}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.heroActionWrapper,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#06B6D4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroAction}
                  >
                    <Text style={styles.heroActionText}>Bắt đầu ôn tập</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroDeckTitle}>Chưa có bộ thẻ</Text>
                <Text style={styles.heroDeckMeta}>
                  Kéo xuống để tải lại hoặc tạo bộ thẻ thủ công.
                </Text>
              </View>
            )}
          </AppCard>

          <View style={styles.statsRow}>
            <StatItem
              label="Tổng thẻ"
              value={totals.totalCards}
              icon="albums-outline"
              color="#4F46E5"
            />
            <StatItem
              label="Đã thuộc"
              value={totals.totalMastered}
              icon="checkmark-circle-outline"
              color="#10B981"
            />
            <StatItem
              label="Tiến độ"
              value={`${totals.progress}%`}
              icon="trending-up-outline"
              color="#F59E0B"
            />
          </View>

          <View style={styles.searchPanel}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm bộ thẻ..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              <Pressable
                onPress={() => {
                  setSourceFilter(undefined);
                  setStatusFilter(undefined);
                  setVisibilityFilter(undefined);
                  setActiveFilter(ALL_FILTER);
                }}
                accessibilityRole="button"
                style={[
                  styles.filterChip,
                  !sourceFilter &&
                  !statusFilter &&
                  !visibilityFilter &&
                  activeFilter === ALL_FILTER
                    ? styles.activeFilterChip
                    : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    !sourceFilter &&
                    !statusFilter &&
                    !visibilityFilter &&
                    activeFilter === ALL_FILTER
                      ? styles.activeFilterText
                      : undefined,
                  ]}
                >
                  Tất cả
                </Text>
              </Pressable>
              {(["manual", "quiz_wrong_answers", "ai_generated"] as const).map(
                (source) => (
                  <Pressable
                    key={source}
                    onPress={() =>
                      setSourceFilter(
                        sourceFilter === source ? undefined : source,
                      )
                    }
                    accessibilityRole="button"
                    style={[
                      styles.filterChip,
                      sourceFilter === source && styles.activeFilterChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        sourceFilter === source && styles.activeFilterText,
                      ]}
                    >
                      {sourceLabels[source]}
                    </Text>
                  </Pressable>
                ),
              )}
              {(["draft", "published", "archived"] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() =>
                    setStatusFilter(
                      statusFilter === status ? undefined : status,
                    )
                  }
                  accessibilityRole="button"
                  style={[
                    styles.filterChip,
                    statusFilter === status && styles.activeFilterChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      statusFilter === status && styles.activeFilterText,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
              {(["private", "public"] as const).map((visibility) => (
                <Pressable
                  key={visibility}
                  onPress={() =>
                    setVisibilityFilter(
                      visibilityFilter === visibility ? undefined : visibility,
                    )
                  }
                  accessibilityRole="button"
                  style={[
                    styles.filterChip,
                    visibilityFilter === visibility && styles.activeFilterChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      visibilityFilter === visibility &&
                        styles.activeFilterText,
                    ]}
                  >
                    {visibility}
                  </Text>
                </Pressable>
              ))}
              {filters.map((filter) => {
                if (filter === ALL_FILTER) {
                  return null;
                }
                const active = activeFilter === filter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.filterChip,
                      active && styles.activeFilterChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.activeFilterText,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Bộ thẻ của bạn</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredDecks.length} bộ thẻ đang hiển thị
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{decks.length} bộ</Text>
            </View>
          </View>

          <View style={styles.deckList}>
            {isLoading && decks.length === 0 ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>Đang tải bộ thẻ...</Text>
              </View>
            ) : error && decks.length === 0 ? (
              <FeedbackCard
                icon="cloud-offline-outline"
                title="Không tải được dữ liệu"
                message={error}
                actionLabel="Thử lại"
                onAction={refreshDecks}
              />
            ) : filteredDecks.length > 0 ? (
              filteredDecks.map((deck, index) => (
                <DeckCard key={deck.id} deck={deck} index={index} />
              ))
            ) : (
              <FeedbackCard
                icon="file-tray-outline"
                title="Không tìm thấy bộ thẻ"
                message="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  eyebrow: {
    color: "#4F46E5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 6,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    marginHorizontal: 20,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heroLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroTitle: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "800",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },
  heroDeckTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 5,
  },
  heroDeckMeta: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
  },
  heroProgressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 18,
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  heroActionWrapper: {
    borderRadius: 18,
    overflow: "hidden",
  },
  heroAction: {
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
  heroEmpty: {
    paddingTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
  },
  statItem: {
    flex: 1,
    minHeight: 96,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.65)",
    padding: 12,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  searchPanel: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    padding: 16,
  },
  searchBar: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(203,213,225,0.55)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
    marginLeft: 10,
  },
  filterContent: {
    paddingTop: 14,
  },
  filterChip: {
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  filterText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },
  countBadge: {
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countBadgeText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "800",
  },
  deckList: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },

  deckCardWrapper: {
    marginBottom: 14,
  },

  deckHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  deckHeaderText: {
    flex: 1,
    marginRight: 10,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deckTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  deckDescription: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 8,
  },
  progressText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },
  progressMeta: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  detailButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  startButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  startButtonGradient: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  detailButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 4,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  iconActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  iconDangerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    minHeight: 136,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  feedbackCard: {
    minHeight: 168,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 14,
  },
  feedbackTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },
  feedbackText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center",
  },
  feedbackAction: {
    borderRadius: 999,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },
  feedbackActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
