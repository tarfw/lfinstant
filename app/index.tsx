import { db } from "@/lib/db";
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity } from "@instantdb/react-native";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EntityKey = keyof AppSchema["entities"];

const ENTITY_OPTIONS: { key: EntityKey; label: string }[] = [
  { key: "nodes", label: "Nodes" },
  { key: "products", label: "Products" },
  { key: "services", label: "Services" },
  { key: "instances", label: "Instances" },
  { key: "bookings", label: "Bookings" },
  { key: "orders", label: "Orders" },
  { key: "contributors", label: "Contributors" },
  { key: "tasks", label: "Tasks" },
  { key: "transactions", label: "Transactions" },
  { key: "reviews", label: "Reviews" },
  { key: "slots", label: "Slots" },
  { key: "conversations", label: "Conversations" },
  { key: "chat", label: "Chat" },
  { key: "lineitems", label: "Line Items" },
  { key: "memories", label: "Memories" },
];

function App() {
  const [selectedEntity, setSelectedEntity] = useState<EntityKey>("nodes");
  const [showModal, setShowModal] = useState(false);

  const getOrderConfig = (entity: EntityKey) => {
    const orderFields: Partial<Record<EntityKey, string>> = {
      nodes: "name",
      products: "name",
      services: "name",
      bookings: "date",
      slots: "date",
      contributors: "name",
      orders: "status",
      tasks: "status",
    };
    const field = orderFields[entity];
    return field ? { order: { [field]: "asc" } } : {};
  };

  const { isLoading, error, data } = db.useQuery({
    [selectedEntity]: {
      $: getOrderConfig(selectedEntity),
    },
  } as any);

  const currentOption = ENTITY_OPTIONS.find((opt) => opt.key === selectedEntity);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const items = (data?.[selectedEntity] || []) as InstaQLEntity<
    typeof AppSchema,
    EntityKey
  >[];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.selectorText}>{currentOption?.label}</Text>
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntityItem entity={selectedEntity} data={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {currentOption?.label.toLowerCase()} found
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Entity</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {ENTITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedEntity(option.key);
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{option.label}</Text>
                  {selectedEntity === option.key && (
                    <Text style={styles.modalItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function EntityItem({ entity, data }: { entity: EntityKey; data: any }) {
  const renderContent = () => {
    switch (entity) {
      case "nodes":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.type} • {data.city}
            </Text>
            <Text style={styles.itemDetail}>
              Rating: {data.rating} • {data.address}
            </Text>
          </View>
        );
      case "products":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.category} • {data.nodeid}
            </Text>
            <Text style={styles.itemDetail}>
              ${data.price} {data.currency} • Stock: {data.stock}
            </Text>
          </View>
        );
      case "services":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.category} • {data.duration} min
            </Text>
            <Text style={styles.itemDetail}>
              ${data.price} {data.currency} • Max per slot: {data.maxperslot}
            </Text>
          </View>
        );
      case "instances":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.instancetype} • {data.status}
            </Text>
            <Text style={styles.itemDetail}>
              Qty: {data.qty} • Available: {data.available}
            </Text>
          </View>
        );
      case "bookings":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.date} • {data.start}-{data.end}
            </Text>
            <Text style={styles.itemDetail}>
              Status: {data.status} • ${data.price}
            </Text>
          </View>
        );
      case "orders":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>Order #{data.ordernum}</Text>
            <Text style={styles.itemSubtitle}>
              {data.ordertype} • {data.status}
            </Text>
            <Text style={styles.itemDetail}>
              Total: ${data.total} {data.currency}
            </Text>
          </View>
        );
      case "contributors":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemSubtitle}>
              {data.role} • {data.email}
            </Text>
            <Text style={styles.itemDetail}>
              {data.phone} • Active: {data.active ? "Yes" : "No"}
            </Text>
          </View>
        );
      case "slots":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>
              {data.date} • {data.start}-{data.end}
            </Text>
            <Text style={styles.itemSubtitle}>
              Service: {data.serviceid}
            </Text>
            <Text style={styles.itemDetail}>
              Booked: {data.booked}/{data.capacity} • Status: {data.status}
            </Text>
          </View>
        );
      case "tasks":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.title}</Text>
            <Text style={styles.itemSubtitle}>
              {data.tasktype} • {data.status}
            </Text>
            <Text style={styles.itemDetail}>
              Rel: {data.reltype} • Seq: {data.seq}
            </Text>
          </View>
        );
      case "transactions":
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>
              {data.amount} {data.currency}
            </Text>
            <Text style={styles.itemSubtitle}>
              {data.paymethod} • {data.status}
            </Text>
            <Text style={styles.itemDetail}>
              Platform fee: {data.platformfee} • Node fee: {data.nodefee}
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{data.name || data.id}</Text>
            <Text style={styles.itemDetail}>Entity: {entity}</Text>
          </View>
        );
    }
  };

  return <View style={styles.item}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  selectorText: {
    fontSize: 16,
    color: "#000000",
    marginRight: 8,
  },
  selectorArrow: {
    fontSize: 12,
    color: "#000000",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#000000",
  },
  errorText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
  listItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemId: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  itemData: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "monospace",
  },
  item: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemContainer: {},
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 13,
    color: "#666666",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#000000",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    maxHeight: "70%",
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  closeButton: {
    fontSize: 24,
    color: "#000000",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000000",
  },
  checkmark: {
    fontSize: 18,
    color: "#000000",
  },
});

export default App;
