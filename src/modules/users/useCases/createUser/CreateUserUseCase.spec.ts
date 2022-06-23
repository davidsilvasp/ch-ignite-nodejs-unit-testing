import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a user.", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const createUser = jest.spyOn(inMemoryUsersRepository, "create");

    const user = {
      name: "Teste",
      email: "teste@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    expect(createUser).toHaveBeenCalled();
  });

  it("should not be able to create a new user if it already exists", async () => {
    const user = {
      name: "Teste",
      email: "teste@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    await expect(createUserUseCase.execute(user)).rejects.toEqual(
      new CreateUserError()
    );
  });
});
