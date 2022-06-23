import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user.", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate an user", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const session = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(session).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const session = {
      email: "nobody@email.com",
      password: "123456",
    };

    await expect(authenticateUserUseCase.execute(session)).rejects.toEqual(
      new IncorrectEmailOrPasswordError()
    );
  });

  it("should not be able to authenticate a user with incorrect email", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const session = {
      email: "incorrect@email.com",
      password: user.password,
    };

    await expect(authenticateUserUseCase.execute(session)).rejects.toEqual(
      new IncorrectEmailOrPasswordError()
    );
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const session = {
      email: user.email,
      password: "incorrect_123",
    };

    await expect(authenticateUserUseCase.execute(session)).rejects.toEqual(
      new IncorrectEmailOrPasswordError()
    );
  });
});
