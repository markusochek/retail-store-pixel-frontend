
import {DataSource, Repository} from 'typeorm';
import {UserEntity} from '../entities/user.entity';

export class UserService {
    private userRepository: Repository<UserEntity>;

    constructor(connection: DataSource) {
        this.userRepository = connection.getRepository(UserEntity);
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepository.find();
    }

    async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.existsBy({ email });
    }

    async create(userData: UserEntity) {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string) {
        return this.userRepository.findOneBy({ email });
    }
}