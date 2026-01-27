import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateUserSchema } from "@/schema/userSchema";
import { tr } from "date-fns/locale";

import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const userId = Array.isArray(id) ? id[0] : id;
    try {
        switch (req.method) {
            case "GET": {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user)
                    return res.status(404).json(fail("User not found"));
                return res.status(200).json(success(user));
            }
            case "PATCH": {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user)
                    return res.status(404).json(fail("User not found"));

                const body = UpdateUserSchema.parse(req.body);
                const updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        fullname: body.fullname,
                        username: body.username,
                        role: body.role,
                        is_active: body.is_active,
                    },
                });

                return res.status(200).json(success(updatedUser));
            }
            case "DELETE": {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                    });
                    if (!user)
                        return res.status(404).json(fail("User not found"));

                    await prisma.user.update({
                        where: { username: user.username },
                        data: {
                            deletedAt: new Date(),
                            is_active: false
                        }
                    });

                    return res.status(200).json(success({ message: "User deleted successfully" }));
                } catch (error) {
                    console.error("Error deleting user:", error);
                    return res.status(500).json(fail("Failed to delete user"));
                }
            }   
            default:
                return res.status(405).json(fail("Method not allowed"));
        }
    } catch (error) {
        console.error("Error in /api/users/[id]:", error);
        return res.status(500).json(fail("Internal server error"));
    }
}

export default verifyToken(handler);