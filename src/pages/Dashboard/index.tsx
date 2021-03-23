import { useEffect } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useObjectState } from 'hooks/useObjectState';

export type FoodData = {
	id: number;
	name: string;
	description: string;
	price: number;
	available: boolean;
	image: string;
};

type DashBoardState = {
	foods: FoodData[];
	editingFood: Record<string, any>;
	modalOpen: boolean;
	editModalOpen: boolean;
};

export type FoodRequest = Omit<FoodData, 'id'>;

export function Dashboard() {
	const [state, setState] = useObjectState<DashBoardState>({
		foods: [],
		editingFood: {},
		modalOpen: false,
		editModalOpen: false,
	});

	useEffect(() => {
		async function getFoods() {
			const response = await api.get<FoodData[]>('/foods');

			setState({ foods: response.data });
		}
		getFoods();
	}, []);

	const handleAddFood = async (food: FoodRequest) => {
		const { foods } = state;

		try {
			const response = await api.post('/foods', {
				...food,
				available: true,
			});

			setState({ foods: [...foods, response.data] });
		} catch (err) {
			console.log(err);
		}
	};

	const handleUpdateFood = async (food: FoodData) => {
		const { foods, editingFood } = state;

		try {
			const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
				...editingFood,
				...food,
			});

			const foodsUpdated = foods.map((f) =>
				f.id !== foodUpdated.data.id ? f : foodUpdated.data
			);

			setState({ foods: foodsUpdated });
		} catch (err) {
			console.log(err);
		}
	};

	const handleDeleteFood = async (id: number) => {
		const { foods } = state;

		await api.delete(`/foods/${id}`);

		const foodsFiltered = foods.filter((food) => food.id !== id);

		setState({ foods: foodsFiltered });
	};

	const toggleModal = () => {
		const { modalOpen } = state;

		setState({ modalOpen: !modalOpen });
	};

	const toggleEditModal = () => {
		const { editModalOpen } = state;

		setState({ editModalOpen: !editModalOpen });
	};

	const handleEditFood = (food: FoodData) => {
		setState({ editingFood: food, editModalOpen: true });
	};

	const { modalOpen, editModalOpen, editingFood, foods } = state;

	return (
		<>
			<Header openModal={toggleModal} />
			<ModalAddFood
				isOpen={modalOpen}
				setIsOpen={toggleModal}
				handleAddFood={handleAddFood}
			/>
			<ModalEditFood
				isOpen={editModalOpen}
				setIsOpen={toggleEditModal}
				editingFood={editingFood}
				handleUpdateFood={handleUpdateFood}
			/>

			<FoodsContainer data-testid="foods-list">
				{foods &&
					foods.map((food) => (
						<Food
							key={food.id}
							food={food}
							handleDelete={handleDeleteFood}
							handleEditFood={handleEditFood}
						/>
					))}
			</FoodsContainer>
		</>
	);
}

export default Dashboard;
