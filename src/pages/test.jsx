import {Autocomplete, AutocompleteItem, Button} from "@heroui/react";
import {useState} from "react";

export const animals = [
  {label: "Cat", key: "cat", description: "The second most popular pet in the world"},
  {label: "Dog", key: "dog", description: "The most popular pet in the world"},
  {label: "Elephant", key: "elephant", description: "The largest land animal"},
  {label: "Lion", key: "lion", description: "The king of the jungle"},
  {label: "Tiger", key: "tiger", description: "The largest cat species"},
  {label: "Giraffe", key: "giraffe", description: "The tallest land animal"},
  {label: "Dolphin", key: "dolphin", description: "A widely distributed and diverse group of aquatic mammals"},
  {label: "Penguin", key: "penguin", description: "A group of aquatic flightless birds"},
  {label: "Zebra", key: "zebra", description: "Several species of African equids"},
  {label: "Shark", key: "shark", description: "A group of elasmobranch fish with cartilaginous skeleton"},
  {label: "Whale", key: "whale", description: "Diverse group of fully aquatic placental marine mammals"},
  {label: "Otter", key: "otter", description: "A carnivorous mammal in the subfamily Lutrinae"},
  {label: "Crocodile", key: "crocodile", description: "A large semiaquatic reptile"},
];

export default function App() {
  const [selectedAnimal, setSelectedAnimal] = useState("cat");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`You selected: ${selectedAnimal}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs">
      <Autocomplete
        isRequired
        defaultItems={animals}
        defaultSelectedKey="cat"
        label="Favorite Animal"
        placeholder="Search an animal"
        selectedKey={selectedAnimal}
        onSelectionChange={setSelectedAnimal}
      >
        {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
      </Autocomplete>

      <Button type="submit" color="primary">
        Submit
      </Button>
    </form>
  );
}
