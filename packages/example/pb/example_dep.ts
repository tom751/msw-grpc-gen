// @generated by protobuf-ts 2.9.0 with parameter server_grpc1
// @generated from protobuf file "example_dep.proto" (syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Address
 */
export interface Address {
    /**
     * @generated from protobuf field: string first_line = 1;
     */
    firstLine: string;
    /**
     * @generated from protobuf field: string second_line = 2;
     */
    secondLine: string;
    /**
     * @generated from protobuf field: string town = 3;
     */
    town: string;
    /**
     * @generated from protobuf field: string country = 4;
     */
    country: string;
    /**
     * @generated from protobuf field: string post_code = 5;
     */
    postCode: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class Address$Type extends MessageType<Address> {
    constructor() {
        super("Address", [
            { no: 1, name: "first_line", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "second_line", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "town", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "country", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "post_code", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<Address>): Address {
        const message = { firstLine: "", secondLine: "", town: "", country: "", postCode: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Address>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Address): Address {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string first_line */ 1:
                    message.firstLine = reader.string();
                    break;
                case /* string second_line */ 2:
                    message.secondLine = reader.string();
                    break;
                case /* string town */ 3:
                    message.town = reader.string();
                    break;
                case /* string country */ 4:
                    message.country = reader.string();
                    break;
                case /* string post_code */ 5:
                    message.postCode = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: Address, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string first_line = 1; */
        if (message.firstLine !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.firstLine);
        /* string second_line = 2; */
        if (message.secondLine !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.secondLine);
        /* string town = 3; */
        if (message.town !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.town);
        /* string country = 4; */
        if (message.country !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.country);
        /* string post_code = 5; */
        if (message.postCode !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.postCode);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Address
 */
export const Address = new Address$Type();
