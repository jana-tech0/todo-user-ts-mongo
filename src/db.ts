import mongoose, { Schema, Document} from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    name: string;
}

interface ITodo extends Document {
    title: string;
    done: boolean;
    userId: mongoose.Types.ObjectId;
}

const UserSchema = new Schema <IUser> ({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    name: { type: String, required: true}
})

const TodoSchema = new Schema <ITodo> ({
    title: { type: String, required: true},
    done: { type: Boolean, default: false},
    userId: { type: Schema.Types.ObjectId,ref: "User", require: true}
})

export const UserModel = mongoose.model<IUser>("User",UserSchema);
export const TodoModel = mongoose.model<ITodo>("Todo",TodoSchema);

