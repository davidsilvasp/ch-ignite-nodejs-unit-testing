import { ProfileMap } from "../../mappers/ProfileMap";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to get a user profile", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const profile = await showUserProfileUseCase.execute(
      authenticatedUser.user.id
    );

    const profileDTO = ProfileMap.toDTO(profile);

    expect(profileDTO).toHaveProperty("id");
    expect(profileDTO).toHaveProperty("email");
    expect(profileDTO).not.toHaveProperty("password");
  });

  it("should not be able to get a profile of a non-existing user", async () => {
    const nonExistingUserId = "39f0128a-dbcc-476d-83ee-67f67ae44111";

    await expect(
      showUserProfileUseCase.execute(nonExistingUserId)
    ).rejects.toEqual(new ShowUserProfileError());
  });
});
